import type { FilterOptionsOptions } from "@/components/Filter/FilterOptions"
import type { SearchResult } from "@/components/SearchResult/SearchResultItem"

export const SmartSearchEventNames = {
  FILTER_CHANGE: "ss-filter-change",
  INPUT_CHANGE: "ss-input-change",
  INPUT_FOCUS: "ss-input-focus",
  INPUT_BLUR: "ss-input-blur",
  MENU_CLOSE: "ss-menu-close",
  MENU_OPEN: "ss-menu-open",
  MENU_SELECT: "ss-menu-select",
  MENU_HOVER: "ss-menu-hover",
  MENU_BLUR: "ss-menu-blur",
  MENU_KEYDOWN: "ss-menu-keydown",
  MENU_KEYUP: "ss-menu-keyup",
  MENU_KEYPRESS: "ss-menu-keypress",
} as const

export const SmartSearchConstraintsAttrs = {
  boolAttrs: [
    "clearable",
    "disabled",
    "closeMenuOnBlur",
    "closeMenuOnSelect",
    "openMenuOnFocus",
    "openMenuOnInput",
    "menuMatchWidth",
    "closeOnEscape",
    "closeOnClickOutside",
  ],
  intAttrs: ["menuMinHeight", "menuMaxHeight", "menuOffset", "debounce"],
  objectAttrs: ["filters", "options"],
}

export type SmartSearchAttrs = {
  placeholder?: string
  debounce?: number
  name?: string
  id?: string
  filters?: FilterOptionsOptions[]
  clearable?: boolean
  options?: SearchResult[]
  fetchDataOn?: "input" | "focus" | ""
  datasource: string
  disabled?: boolean

  // menu behavior
  closeMenuOnBlur?: boolean
  closeMenuOnSelect?: boolean
  openMenuOnFocus?: boolean
  openMenuOnInput?: boolean
  menuMinHeight?: number

  // menu positioning / sizing
  menuMaxHeight?: number
  menuOffset?: number
  menuPlacement?: string
  menuMatchWidth?: boolean

  // menu close triggers
  closeOnEscape?: boolean
  closeOnClickOutside?: boolean
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
  disabled: false,

  closeMenuOnBlur: true,
  closeMenuOnSelect: true,
  openMenuOnFocus: false,
  openMenuOnInput: true,
  menuMinHeight: 200,

  menuMaxHeight: 360,
  menuOffset: 4,
  menuPlacement: "bottom-start",
  menuMatchWidth: true,

  closeOnEscape: true,
  closeOnClickOutside: true,
} as SmartSearchAttrs
