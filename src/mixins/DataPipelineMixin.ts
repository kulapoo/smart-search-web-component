import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import { isGroupedResults, type SearchResultGroup, type SearchResults } from "@/components/SearchResult/SearchResultList"
import type { Constructor } from "@/mixins/types"
import type { DataAdapter, ResponseTransformer, ResultRenderer } from "@/types/datasource"
import { ResultCache } from "@/utils/result-cache"
import { fireEvent } from "@/utils/events"
import { SmartSearchEventNames } from "@/SmartSearchConstants"

export interface DataPipelineHost {
  dataAdapter: DataAdapter | null
  transformResponse: ResponseTransformer
  resultRenderer: ResultRenderer | null
  options: SearchResults
  loadData(query?: string): Promise<void>
  clearCache(): void
}

export function DataPipelineMixin<T extends Constructor<HTMLElement>>(Base: T) {
  return class DataPipelineElement extends Base implements DataPipelineHost {
    #dataAdapter: DataAdapter | null = null
    #transformResponse: ResponseTransformer = (r) => r as SearchResults
    #resultRenderer: ResultRenderer | null = null
    #cache = new ResultCache()
    #inflight: AbortController | null = null
    #staticOptions: SearchResults = []

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

    set resultRenderer(fn: ResultRenderer | null) {
      this.#resultRenderer = fn
    }
    get resultRenderer(): ResultRenderer | null {
      return this.#resultRenderer
    }

    set options(opts: SearchResults) {
      this.#staticOptions = opts
      const self = this as unknown as {
        menuInstance?: { isOpen: boolean }
        getInputEl?(): HTMLInputElement
      }
      if (self.menuInstance?.isOpen) {
        const query = self.getInputEl?.()?.value ?? ""
        this.loadData(query)
      }
    }
    get options(): SearchResults {
      return this.#staticOptions
    }

    clearCache(): void {
      this.#cache.clear()
    }

    async loadData(query?: string): Promise<void> {
      // Cancel any in-flight request
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
      const hasStaticOptions = Array.isArray(this.#staticOptions) && this.#staticOptions.length > 0

      if (!hasAdapter && !datasource && !hasStaticOptions) {
        return
      }

      self.setLoading?.(true)

      try {
        let results: SearchResults

        if (hasAdapter) {
          results = await this.#dataAdapter!(q, signal)
        } else if (datasource) {
          results = await this.#fetchFromDatasource(datasource, q, signal)
        } else {
          results = this.#filterStatic(q)
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

    #filterStatic(query: string): SearchResults {
      const q = query.toLowerCase()
      if (!q) return this.#staticOptions

      if (isGroupedResults(this.#staticOptions)) {
        return (this.#staticOptions as SearchResultGroup[])
          .map((g) => ({
            ...g,
            options: g.options.filter(
              (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
            ),
          }))
          .filter((g) => g.options.length > 0)
      }

      return (this.#staticOptions as SearchResult[]).filter(
        (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
      )
    }
  }
}
