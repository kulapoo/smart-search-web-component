import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import type { SearchResults } from "@/components/SearchResult/SearchResultList"

export type FilterOptionFn<T extends Record<string, unknown> = Record<string, unknown>> = (
  option: SearchResult<T>,
  searchTerm: string,
  filters: Array<{ field: string; value: string }>,
) => boolean

export type DataAdapter<T extends Record<string, unknown> = Record<string, unknown>> = (
  requestQuery: Record<string, unknown>,
  signal: AbortSignal,
) => Promise<SearchResults<T>> | SearchResults<T>

export type ResponseTransformer<T extends Record<string, unknown> = Record<string, unknown>> = (
  response: unknown,
  requestQuery: string,
) => SearchResults<T>

export type ResultItemRendererFn<T extends Record<string, unknown> = Record<string, unknown>> = (
  result: SearchResult<T>,
  searchTerm: string,
) => Node | string

export type FilterItemRendererFn = (option: import("@/components/Filter/FilterOption").FilterOptionData) => Node | string

export interface CacheEntry<T extends Record<string, unknown> = Record<string, unknown>> {
  results: SearchResults<T>
  timestamp: number
}
