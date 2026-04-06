import { SmartSearch, SmartSearchEventNames } from "@/SmartSearch"
import { Input } from "@/components/Input/Input"
import { Menu } from "@/components/Menu/Menu"
import {
  SearchResultList,
  type SearchResultGroup,
  type SearchResults,
} from "@/components/SearchResult/SearchResultList"
import { SearchResultItem, type SearchResult } from "@/components/SearchResult/SearchResultItem"
import { FilterOption, type FilterOptionData } from "@/components/Filter/FilterOption"
import { FilterOptions } from "@/components/Filter/FilterOptions"
import type {
  FilterItemRendererFn,
  ResultItemRendererFn,
  DataAdapter,
  ResponseTransformer,
  FilterOptionFn,
} from "@/types/datasource"

export type {
  SearchResult,
  SearchResultGroup,
  SearchResults,
  FilterOptionData,
  FilterItemRendererFn,
  ResultItemRendererFn,
  DataAdapter,
  ResponseTransformer,
  FilterOptionFn,
}
export { SmartSearch, SmartSearchEventNames }

customElements.define(Input.tagName, Input)
customElements.define(Menu.tagName, Menu)
customElements.define(SearchResultList.tagName, SearchResultList)
customElements.define(SearchResultItem.tagName, SearchResultItem)
customElements.define(FilterOption.tagName, FilterOption)
customElements.define(FilterOptions.tagName, FilterOptions)
customElements.define(SmartSearch.tagName, SmartSearch)
