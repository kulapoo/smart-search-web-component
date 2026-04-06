import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import {
  isGroupedResults,
  type SearchResultGroup,
  type SearchResults,
} from "@/components/SearchResult/SearchResultList"
import type { Constructor } from "@/mixins/types"
import type { DataAdapter, FilterOptionFn, ResponseTransformer, ResultItemRendererFn } from "@/types/datasource"
import { ResultCache } from "@/utils/result-cache"
import { fireEvent } from "@/utils/events"
import { SmartSearchEventNames } from "@/SmartSearchConstants"

export interface SmartSearchDataPipelineHost {
  dataAdapter: DataAdapter | null
  transformResponse: ResponseTransformer
  resultItemRenderer: ResultItemRendererFn | null
  filterOption: FilterOptionFn | null
  options: SearchResults
  hasOptions: boolean
  loadData(searchTerm: string, filters?: Array<{ field: string; value: string }>): Promise<void>
  clearCache(): void
}

/** Same grouping as URL params: duplicate fields → `field[0]=…&field[1]=…` */
export function groupFiltersByField(filters: Array<{ field: string; value: string }>): Map<string, string[]> {
  const grouped = new Map<string, string[]>()
  for (const f of filters) {
    const existing = grouped.get(f.field)
    if (existing) existing.push(f.value)
    else grouped.set(f.field, [f.value])
  }
  return grouped
}

function metadataValueMatchesAny(value: unknown, allowed: string[]): boolean {
  if (value == null) return false
  if (Array.isArray(value)) {
    return value.some((item) => allowed.includes(String(item)))
  }
  return allowed.includes(String(value))
}

export function composeQueryString(searchTerm: string, filters: Array<{ field: string; value: string }>): string {
  const parts = [`q=${searchTerm}`]

  const grouped = groupFiltersByField(filters)
  for (const [field, values] of grouped) {
    if (values.length === 1) {
      parts.push(`${encodeURIComponent(field)}=${encodeURIComponent(values[0])}`)
    } else {
      values.forEach((v, i) => parts.push(`${encodeURIComponent(field)}[${i}]=${encodeURIComponent(v)}`))
    }
  }

  return parts.join("&")
}

export function SmartSearchDataPipelineMixin<T extends Constructor<HTMLElement>>(Base: T) {
  return class SmartSearchDataPipelineElement extends Base implements SmartSearchDataPipelineHost {
    #dataAdapter: DataAdapter | null = null
    #transformResponse: ResponseTransformer = (r) => r as SearchResults
    #resultItemRenderer: ResultItemRendererFn | null = null
    #filterOption: FilterOptionFn | null = null
    #cache = new ResultCache()
    #inflight: AbortController | null = null
    #results: SearchResults = []

    set dataAdapter(fn: DataAdapter | null) {
      this.#dataAdapter = fn
    }
    get dataAdapter(): DataAdapter | null {
      return this.#dataAdapter
    }

    set transformResponse(fn: ResponseTransformer) {
      this.#transformResponse = fn
    }
    get transformResponse(): ResponseTransformer {
      return this.#transformResponse
    }

    set resultItemRenderer(fn: ResultItemRendererFn | null) {
      this.#resultItemRenderer = fn
    }
    get resultItemRenderer(): ResultItemRendererFn | null {
      return this.#resultItemRenderer
    }

    set filterOption(fn: FilterOptionFn | null) {
      this.#filterOption = fn
    }
    get filterOption(): FilterOptionFn | null {
      return this.#filterOption
    }

    set options(results: SearchResults) {
      this.#results = results
      this.#cache.clear()
      const self = this as unknown as {
        menuInstance?: { isOpen: boolean }
        getInputEl?(): HTMLInputElement
        loadData?(searchTerm?: string): Promise<void>
      }
      if (self.menuInstance?.isOpen) {
        const searchTerm = self.getInputEl?.()?.value ?? ""
        self.loadData?.(searchTerm)
      }
    }
    get options(): SearchResults {
      return this.#results
    }

    get hasOptions(): boolean {
      return this.#results.length > 0
    }

    clearCache(): void {
      this.#cache.clear()
    }

    async loadData(searchTerm: string, filters: Array<{ field: string; value: string }> = []): Promise<void> {
      this.#inflight?.abort()
      this.#inflight = new AbortController()
      const signal = this.#inflight.signal

      const requestQuery = composeQueryString(searchTerm, filters)
      const self = this as unknown as {
        getInputEl?(): HTMLInputElement
        getAttrs?(): { datasource?: string }
        setLoading?(loading: boolean): void
        loadResults?(results: SearchResults, searchTerm: string): void
      }

      const cached = this.#cache.get(requestQuery)
      if (cached) {
        self.loadResults?.(cached, searchTerm)
        return
      }

      const hasAdapter = this.#dataAdapter !== null
      const datasource = self.getAttrs?.()?.datasource ?? ""

      if (!hasAdapter && !datasource && !this.hasOptions) {
        return
      }

      self.setLoading?.(true)

      try {
        let results: SearchResults

        if (hasAdapter) {
          results = await this.#dataAdapter!({ searchTerm, ...filters }, signal)
          this.#results = results
        } else if (datasource) {
          results = await this.#fetchFromDatasource(datasource, requestQuery, signal)
          this.#results = results
        } else {
          results = this.#filterOptions(searchTerm, filters)
        }

        if (signal.aborted) return

        this.#cache.set(requestQuery, results)
        self.loadResults?.(results, searchTerm)
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        fireEvent(this, SmartSearchEventNames.LOAD_ERROR, { error: err, requestQuery })
        self.setLoading?.(false)
      }
    }

    async #fetchFromDatasource(datasource: string, requestQuery: string, signal: AbortSignal): Promise<SearchResults> {
      const url = datasource.includes("{{q}}")
        ? datasource.replace("{{q}}", requestQuery)
        : `${datasource}${datasource.includes("?") ? "&" : "?"}${requestQuery}`

      const response = await fetch(url, { signal })
      const json = await response.json()
      return this.#transformResponse(json, requestQuery)
    }

    #filterOptions(searchTerm: string, filters: Array<{ field: string; value: string }>): SearchResults {
      const matchesFilterFields = (o: SearchResult) => {
        if (filters.length === 0) return true
        const meta = o.metadata
        if (!meta) return false
        const grouped = groupFiltersByField(filters)
        for (const [field, allowedValues] of grouped) {
          if (!metadataValueMatchesAny(meta[field], allowedValues)) return false
        }
        return true
      }

      const q = searchTerm.toLowerCase()
      const defaultMatch = (o: SearchResult) =>
        !q || o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)

      const match = this.#filterOption
        ? (o: SearchResult) => this.#filterOption!(o, searchTerm, filters)
        : (o: SearchResult) => matchesFilterFields(o) && defaultMatch(o)

      if (isGroupedResults(this.#results)) {
        return (this.#results as SearchResultGroup[])
          .map((g) => ({ ...g, options: g.options.filter(match) }))
          .filter((g) => g.options.length > 0)
      }

      return (this.#results as SearchResult[]).filter(match)
    }
  }
}
