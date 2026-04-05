import type { SearchResults } from "@/components/SearchResult/SearchResultList"
import type { CacheEntry } from "@/types/datasource"

export class ResultCache<T extends Record<string, unknown> = Record<string, unknown>> {
  #map = new Map<string, CacheEntry<T>>()
  #maxSize: number
  #ttl: number

  constructor(maxSize = 50, ttl = 60_000) {
    this.#maxSize = maxSize
    this.#ttl = ttl
  }

  get(query: string): SearchResults<T> | undefined {
    const entry = this.#map.get(query)
    if (!entry) return undefined

    if (Date.now() - entry.timestamp > this.#ttl) {
      this.#map.delete(query)
      return undefined
    }

    return entry.results
  }

  set(query: string, results: SearchResults<T>): void {
    if (this.#map.size >= this.#maxSize) {
      const oldest = this.#map.keys().next().value
      if (oldest !== undefined) this.#map.delete(oldest)
    }
    this.#map.set(query, { results, timestamp: Date.now() })
  }

  clear(): void {
    this.#map.clear()
  }
}
