import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import { isGroupedResults, type SearchResultGroup, type SearchResults } from "@/components/SearchResult/SearchResultList"
import type { Constructor } from "@/mixins/types"
import type { DataAdapter, FilterOptionFn, ResponseTransformer, ResultItemRendererFn } from "@/types/datasource"
import { ResultCache } from "@/utils/result-cache"
import { fireEvent } from "@/utils/events"
import { SmartSearchEventNames } from "@/SmartSearchConstants"

export interface DataPipelineHost {
  dataAdapter: DataAdapter | null
  transformResponse: ResponseTransformer
  resultItemRenderer: ResultItemRendererFn | null
  filterOption: FilterOptionFn | null
  options: SearchResults
  hasOptions: boolean
  loadData(query?: string): Promise<void>
  clearCache(): void
}

export function DataPipelineMixin<T extends Constructor<HTMLElement>>(Base: T) {
  return class DataPipelineElement extends Base implements DataPipelineHost {
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
        loadData?(query?: string): Promise<void>
      }
      if (self.menuInstance?.isOpen) {
        const query = self.getInputEl?.()?.value ?? ""
        self.loadData?.(query)
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

    async loadData(query?: string): Promise<void> {
      this.#inflight?.abort()
      this.#inflight = new AbortController()
      const signal = this.#inflight.signal

      const self = this as unknown as {
        getInputEl?(): HTMLInputElement
        getAttrs?(): { datasource?: string }
        setLoading?(loading: boolean): void
        loadResults?(results: SearchResults, query: string): void
      }

      const q = query ?? self.getInputEl?.()?.value ?? ""

      const cached = this.#cache.get(q)
      if (cached) {
        self.loadResults?.(cached, q)
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
          results = await this.#dataAdapter!(q, signal)
          this.#results = results
        } else if (datasource) {
          results = await this.#fetchFromDatasource(datasource, q, signal)
          this.#results = results
        } else {
          results = this.#filterOptions(q)
        }

        if (signal.aborted) return

        this.#cache.set(q, results)
        self.loadResults?.(results, q)
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        fireEvent(this, SmartSearchEventNames.LOAD_ERROR, { error: err, query: q })
        self.setLoading?.(false)
      }
    }

    async #fetchFromDatasource(datasource: string, query: string, signal: AbortSignal): Promise<SearchResults> {
      const url = datasource.includes("{{query}}")
        ? datasource.replace("{{query}}", encodeURIComponent(query))
        : `${datasource}${datasource.includes("?") ? "&" : "?"}q=${encodeURIComponent(query)}`

      const response = await fetch(url, { signal })
      const json = await response.json()
      return this.#transformResponse(json, query)
    }

    #filterOptions(query: string): SearchResults {
      const q = query.toLowerCase()
      if (!q) return this.#results

      const defaultMatch = (o: SearchResult) =>
        o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)

      const match = this.#filterOption
        ? (o: SearchResult) => this.#filterOption!(o, query)
        : defaultMatch

      if (isGroupedResults(this.#results)) {
        return (this.#results as SearchResultGroup[])
          .map((g) => ({ ...g, options: g.options.filter(match) }))
          .filter((g) => g.options.length > 0)
      }

      return (this.#results as SearchResult[]).filter(match)
    }
  }
}
