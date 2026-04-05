import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import type { SearchResults } from "@/components/SearchResult/SearchResultList"

export type DataAdapter<T extends Record<string, unknown> = Record<string, unknown>> = (
  query: string,
  signal: AbortSignal,
) => Promise<SearchResults<T>> | SearchResults<T>

export type ResponseTransformer<T extends Record<string, unknown> = Record<string, unknown>> = (
  response: unknown,
  query: string,
) => SearchResults<T>

export type ResultRenderer<T extends Record<string, unknown> = Record<string, unknown>> = (
  result: SearchResult<T>,
  query: string,
) => Node | string

export interface CacheEntry<T extends Record<string, unknown> = Record<string, unknown>> {
  results: SearchResults<T>
  timestamp: number
}
