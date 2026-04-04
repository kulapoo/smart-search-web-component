import type { FilterOptionsOptions } from "@/components/Filter/FilterOptions"
import type { SearchResult } from "@/components/SearchResult/SearchResultItem"

export const SmartSearchEventNames = {
  FILTER_CHANGE: "ss-filter-change",
  INPUT_CHANGE: "ss-input-change",
  MENU_CLOSE: "ss-menu-close",
  MENU_OPEN: "ss-menu-open",
  MENU_SELECT: "ss-menu-select",
  MENU_HOVER: "ss-menu-hover",
  MENU_BLUR: "ss-menu-blur",
  MENU_KEYDOWN: "ss-menu-keydown",
  MENU_KEYUP: "ss-menu-keyup",
  MENU_KEYPRESS: "ss-menu-keypress",
} as const

export type SmartSearchAttrs = {
  placeholder?: string
  debounce?: number
  name?: string
  id?: string
  filters?: FilterOptionsOptions[]
  clearable?: boolean
  options?: SearchResult[]
  fetchDataOn?: "input" | "blur" | "focus" | "all"
  datasource: string
}

export const DefaultSmartSearchAttrs = {
  placeholder: "Search",
  debounce: 300,
  name: "search",
  id: undefined,
  filters: [],
  clearable: true,
  options: [],
  fetchDataOn: "input",
  datasource: "",
} as SmartSearchAttrs
