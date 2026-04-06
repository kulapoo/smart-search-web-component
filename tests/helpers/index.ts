import { vi } from "vitest"

import { Input, type InputOptions } from "@/components/Input/Input"
import { Menu, type MenuOptions } from "@/components/Menu/Menu"
import {
  SearchResultItem,
  type SearchResultItemOptions,
  type SearchResult,
} from "@/components/SearchResult/SearchResultItem"
import { SearchResultList, type SearchResultListOptions } from "@/components/SearchResult/SearchResultList"
import { FilterOption, type FilterOptionConfig, type FilterOptionData } from "@/components/Filter/FilterOption"
import { FilterOptions, type FilterOptionsOptions } from "@/components/Filter/FilterOptions"
import { SmartSearch } from "@/SmartSearch"

const ALL_COMPONENTS: Array<[string, CustomElementConstructor]> = [
  [Input.tagName!, Input as unknown as CustomElementConstructor],
  [Menu.tagName!, Menu as unknown as CustomElementConstructor],
  [SearchResultItem.tagName!, SearchResultItem as unknown as CustomElementConstructor],
  [SearchResultList.tagName!, SearchResultList as unknown as CustomElementConstructor],
  [FilterOption.tagName!, FilterOption as unknown as CustomElementConstructor],
  [FilterOptions.tagName!, FilterOptions as unknown as CustomElementConstructor],
  [SmartSearch.tagName!, SmartSearch as unknown as CustomElementConstructor],
]

for (const [tag, cls] of ALL_COMPONENTS) {
  if (!customElements.get(tag)) {
    customElements.define(tag, cls)
  }
}

export const defaultResult: SearchResult = { label: "Apple", value: "apple" }

export const defaultFilterData: FilterOptionData = {
  label: "Sports",
  value: "sports",
  field: "category",
}

const INPUT_HOST_SKIP_ATTRS = new Set(["name", "menuId"])

export function mountInput(attrs: Record<string, string> = {}, overrides: Partial<InputOptions> = {}): Input {
  const opts: InputOptions = {
    name: overrides.name ?? attrs.name ?? "q",
    ...("menuId" in attrs ? { menuId: attrs.menuId } : {}),
    ...overrides,
  }
  const el = new Input(opts)
  document.body.appendChild(el)
  for (const [key, value] of Object.entries(attrs)) {
    if (INPUT_HOST_SKIP_ATTRS.has(key)) continue
    el.setAttribute(key, value)
  }
  return el
}

export function mountMenu(overrides: Partial<MenuOptions> = {}): { el: Menu; anchor: HTMLElement } {
  const anchor = document.createElement("div")
  document.body.appendChild(anchor)

  const opts: MenuOptions = {
    anchor,
    onClose: vi.fn(),
    ...overrides,
  }
  const el = new Menu(opts)
  document.body.appendChild(el)
  return { el, anchor }
}

export function mountSearchResultItem(overrides: Partial<SearchResultItemOptions> = {}): SearchResultItem {
  const opts: SearchResultItemOptions = {
    result: defaultResult,
    onSelect: vi.fn(),
    ...overrides,
  }
  const el = new SearchResultItem(opts)
  document.body.appendChild(el)
  return el
}

export function mountSearchResultList(overrides: Partial<SearchResultListOptions> = {}): SearchResultList {
  const opts: SearchResultListOptions = {
    onSelect: vi.fn(),
    ...overrides,
  }
  const el = new SearchResultList(opts)
  document.body.appendChild(el)
  return el
}

export function mountFilterOption(overrides: Partial<FilterOptionConfig> = {}): FilterOption {
  const opts: FilterOptionConfig = {
    label: defaultFilterData.label,
    value: defaultFilterData.value,
    field: defaultFilterData.field,
    onChange: vi.fn(),
    ...overrides,
  }
  const el = new FilterOption(opts)
  document.body.appendChild(el)
  return el
}

export function mountFilterOptions(overrides: Partial<FilterOptionsOptions> = {}): FilterOptions {
  const opts: FilterOptionsOptions = {
    options: [
      { label: "Sports", value: "sports", field: "category" },
      { label: "Tech", value: "tech", field: "category" },
    ],
    onChange: vi.fn(),
    ...overrides,
  }
  const el = new FilterOptions(opts)
  document.body.appendChild(el)
  return el
}

export function mountSmartSearch(attrs: Record<string, string> = {}): SmartSearch {
  const el = document.createElement(SmartSearch.tagName!) as SmartSearch
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value)
  }
  document.body.appendChild(el)
  return el
}

let mixinCounter = 0

export function makeMixinElement<TAdded>(Mixin: (Base: typeof HTMLElement) => new (...args: unknown[]) => TAdded): {
  mount(): HTMLElement & TAdded
  tag: string
} {
  const tag = `test-mixin-${mixinCounter++}`
  const MixedClass = Mixin(HTMLElement) as unknown as CustomElementConstructor
  customElements.define(tag, MixedClass)

  function mount(): HTMLElement & TAdded {
    const el = document.createElement(tag) as HTMLElement & TAdded
    document.body.appendChild(el)
    return el
  }

  return { mount, tag }
}

export { makeTestComponent } from "./component"
