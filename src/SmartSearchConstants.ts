import type { FilterOptionData } from "@/components/Filter/FilterOption"
import type { SearchResult } from "@/components/SearchResult/SearchResultItem"

export const SmartSearchEventNames = {
  FILTER_CHANGE: "ss-filter-change",
  INPUT_CHANGE: "ss-input-change",
  INPUT_FOCUS: "ss-input-focus",
  INPUT_BLUR: "ss-input-blur",
  MENU_CLOSE: "ss-menu-close",
  MENU_OPEN: "ss-menu-open",
  MENU_SELECT: "ss-menu-select",
  MULTISELECT_CHANGE: "ss-multiselect-change",
  MENU_HOVER: "ss-menu-hover",
  MENU_BLUR: "ss-menu-blur",
  MENU_KEYDOWN: "ss-menu-keydown",
  MENU_KEYUP: "ss-menu-keyup",
  MENU_KEYPRESS: "ss-menu-keypress",
  LOAD_ERROR: "ss-load-error",
  THEME_CHANGE: "ss-theme-change",
} as const

export const SmartSearchConstraintsAttrs = {
  boolAttrs: [
    "clearable",
    "disabled",
    "multiselect",
    "filterMultiple",
    "closeMenuOnBlur",
    "closeMenuOnSelect",
    "openMenuOnFocus",
    "openMenuOnInput",
    "menuMatchWidth",
    "closeOnEscape",
    "closeOnClickOutside",
  ],
  intAttrs: ["menuMinHeight", "menuMaxHeight", "menuOffset", "debounce", "maxResults", "minChars", "maxChars"],
  objectAttrs: ["filters", "options"],
}

export type SmartSearchAttrs = {
  placeholder?: string
  debounce?: number
  name?: string
  id?: string
  filters?: FilterOptionData[]
  filterMultiple?: boolean
  clearable?: boolean
  multiselect?: boolean
  options?: SearchResult[]
  fetchDataOn?: "input" | "focus" | "" | "input-focus"
  datasource: string
  disabled?: boolean
  theme?: "light" | "dark" | "auto" | (string & {})

  // menu behavior
  closeMenuOnBlur?: boolean
  closeMenuOnSelect?: boolean
  openMenuOnFocus?: boolean
  openMenuOnInput?: boolean
  openMenuOnLoadResults?: boolean
  menuMinHeight?: number | string

  // input constraints
  minChars?: number
  maxChars?: number

  // menu positioning / sizing
  menuMaxHeight?: number | string
  menuOffset?: number
  menuPlacement?: string
  menuMatchWidth?: boolean
  maxResults?: number

  // menu close triggers
  closeOnEscape?: boolean
  closeOnClickOutside?: boolean

  // result rendering
  highlightMatches?: boolean
}

export const DefaultSmartSearchAttrs = {
  placeholder: "Search",
  debounce: 300,
  name: "search",
  id: undefined,
  filters: [],
  filterMultiple: false,
  clearable: true,
  multiselect: false,
  options: [],
  fetchDataOn: "input",
  datasource: "",
  disabled: false,
  theme: "auto",

  closeMenuOnBlur: false,
  closeMenuOnSelect: true,
  openMenuOnFocus: true,
  openMenuOnLoadResults: true,
  openMenuOnInput: true,
  menuMinHeight: 100,

  minChars: undefined,
  maxChars: undefined,

  menuMaxHeight: 360,
  menuOffset: 4,
  menuPlacement: "bottom-start",
  menuMatchWidth: true,
  maxResults: undefined,

  closeOnEscape: true,
  closeOnClickOutside: true,

  highlightMatches: true,
} as SmartSearchAttrs
