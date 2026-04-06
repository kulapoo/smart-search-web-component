import { Component } from "@/components/Component"
import { Input } from "@/components/Input/Input"
import { Menu, type MenuOptions } from "@/components/Menu/Menu"
import { compose } from "@/mixins/compose"
import { DisabledMixin } from "@/mixins/DisabledMixin"
import { SmartSearchDataPipelineMixin, type SmartSearchDataPipelineHost } from "@/SmartSearchDataPipelineMixin"
import { KeyboardNavMixin, type KeyboardNavHost } from "@/mixins/KeyboardNavMixin"
import type { Constructor } from "@/mixins/types"
import { h } from "@/utils/h"
import { fireEvent } from "@/utils/events"
import { FilterOptions } from "@/components/Filter/FilterOptions"
import type { FilterOptionData } from "@/components/Filter/FilterOption"
import { SearchResultItem, type SearchResult } from "@/components/SearchResult/SearchResultItem"
import { SearchResultList, type SearchResults, isGroupedResults } from "@/components/SearchResult/SearchResultList"
import { createStyles } from "@/styles/styles"
import { SmartSearchEventHandlerMixin, type SmartSearchEventHandlers } from "@/SmartSearchEventHandlerMixin"
import type { FilterItemRendererFn } from "@/types/datasource"
import {
  DefaultSmartSearchAttrs,
  SmartSearchConstraintsAttrs,
  SmartSearchEventNames,
  type SmartSearchAttrs,
} from "@/SmartSearchConstants"
import { menuCustomStyles } from "./components/Menu/Menu.styles"
import { toCamelCase } from "./utils/toCamelCase"
import type { WithLoadData, WithGetAttrs, WithActiveFilters } from "@/types/traits"

export { SmartSearchEventNames } from "@/SmartSearchConstants"

function sliceResults(results: SearchResults, max: number): SearchResults {
  if (isGroupedResults(results)) {
    let remaining = max
    const out = []
    for (const group of results) {
      if (remaining <= 0) break
      const options = group.options.slice(0, remaining)
      out.push({ ...group, options })
      remaining -= options.length
    }
    return out
  }
  return (results as SearchResult[]).slice(0, max)
}

const SmartSearchBase = compose(
  Component,
  DisabledMixin,
  SmartSearchDataPipelineMixin,
  SmartSearchEventHandlerMixin,
  KeyboardNavMixin,
) as Constructor<Component & SmartSearchDataPipelineHost & SmartSearchEventHandlers & KeyboardNavHost>

export class SmartSearch extends SmartSearchBase implements WithLoadData, WithGetAttrs, WithActiveFilters {
  static tagName = "smart-search"
  static className = "ss-smart-search"
  static #instanceCount = 0

  constructor() {
    super()
    this.shadowMode = "open"
  }

  static get observedAttributes(): string[] {
    return Object.keys(DefaultSmartSearchAttrs)
  }

  #menuId = `ss-menu-listbox-${++SmartSearch.#instanceCount}`

  // elements instances
  #inputInstance!: Input
  menuInstance!: Menu
  #searchResultListInstance!: SearchResultList
  #filterOptionsInstance: FilterOptions | null = null
  #liveRegion!: HTMLElement

  // multi-select state
  #selectedItems: SearchResult[] = []

  get selectedItems(): SearchResult[] {
    return [...this.#selectedItems]
  }

  protected configureAria(): void {
    this.setAttribute("aria-label", "Smart Search")
  }

  getInputEl(): HTMLInputElement {
    return this.#inputInstance.inputElement
  }

  #configureInput() {
    const { placeholder, debounce, name, clearable, maxChars } = this.getAttrs()

    const inputOpts = {
      name: name ?? "search",
      menuId: this.#menuId,
      onInput: this.handleInput,
      onBlur: this.handleInputBlur,
      onFocus: this.handleInputFocus,
      onClear: this.handleClear,
      onRemoveChip: this.#removeSelectedItem,
    }
    this.#inputInstance = new Input(inputOpts)

    if (placeholder) this.#inputInstance.setAttribute("placeholder", placeholder)
    if (debounce !== undefined) this.#inputInstance.setAttribute("debounce", String(debounce))
    if (maxChars !== undefined) this.#inputInstance.setAttribute("maxlength", String(maxChars))

    this.#inputInstance.setAttribute("clearable", clearable ? "true" : "")
  }

  #configureMenu() {
    const {
      menuMaxHeight,
      menuOffset,
      menuPlacement,
      menuMatchWidth,
      closeOnEscape,
      closeOnClickOutside,
      filters,
      filterMultiple,
    } = this.getAttrs()

    const menuOpts: MenuOptions = {
      anchor: this.#inputInstance,
      onClose: this.handleMenuClose,
      id: this.#menuId,
      maxHeight: menuMaxHeight,
      offset: menuOffset,
      placement: menuPlacement as MenuOptions["placement"],
      matchWidth: menuMatchWidth,
      closeOnEscape,
      closeOnClickOutside,
    }
    this.menuInstance = new Menu(menuOpts)

    if (!this.#searchResultListInstance) {
      throw new Error("SearchResultList not configured")
    }

    if (filters?.length) {
      this.#filterOptionsInstance = new FilterOptions({
        options: filters,
        onChange: this.handleFilterChange,
        multiple: filterMultiple,
      })
      this.menuInstance.appendChild(this.#filterOptionsInstance)
    }

    this.menuInstance.appendChild(this.#searchResultListInstance)
  }

  /* public methods */
  getAttrs(): SmartSearchAttrs {
    const attrs = Object.keys(DefaultSmartSearchAttrs).reduce((acc, inputKey) => {
      const key = toCamelCase(inputKey)
      const attrValue = this.getAttribute(key)
      let finalValue
      let defaultValue = DefaultSmartSearchAttrs[key as keyof SmartSearchAttrs]
      if (SmartSearchConstraintsAttrs.boolAttrs.includes(key)) {
        finalValue = attrValue !== null ? attrValue !== "true" : defaultValue
      } else if (SmartSearchConstraintsAttrs.intAttrs.includes(key)) {
        finalValue = attrValue ? parseInt(attrValue) : defaultValue
      } else if (SmartSearchConstraintsAttrs.objectAttrs.includes(key)) {
        finalValue = attrValue !== null ? JSON.parse(attrValue || "{}") : defaultValue
      } else {
        finalValue = attrValue ?? defaultValue
      }

      return {
        ...acc,
        [key]: finalValue,
      }
    }, {} as SmartSearchAttrs)

    return attrs
  }

  setLoading(loading: boolean): void {
    this.menuInstance.loading = loading
  }

  loadResults(results: SearchResults, searchTerm: string): void {
    const { openMenuOnLoadResults, maxResults } = this.getAttrs()

    const sliced = maxResults ? sliceResults(results, maxResults) : results
    this.#searchResultListInstance.update(sliced, searchTerm)
    if (this.#selectedItems.length > 0) {
      this.#searchResultListInstance.setSelectedValues(this.#selectedItems.map((i) => i.value))
    }
    const count = isGroupedResults(sliced)
      ? sliced.reduce((sum, group) => sum + group.options.length, 0)
      : sliced.length
    this.menuInstance.empty = count === 0
    this.menuInstance.loading = false
    if (openMenuOnLoadResults && count > 0) {
      this.menuInstance.show()
    }
    this.#announce(count === 0 ? "No results found" : `${count} result${count === 1 ? "" : "s"} available`)
  }

  #configureLiveRegion() {
    this.#liveRegion = h("div", {
      style:
        "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;",
      "aria-live": "polite",
      "aria-atomic": "true",
    })
  }

  #announce(message: string): void {
    this.#liveRegion.textContent = ""
    requestAnimationFrame(() => {
      this.#liveRegion.textContent = message
    })
  }

  override set resultItemRenderer(fn: SmartSearchDataPipelineHost["resultItemRenderer"]) {
    super.resultItemRenderer = fn
    if (this.#searchResultListInstance) {
      this.#searchResultListInstance.resultItemRenderer = fn
    }
  }
  override get resultItemRenderer(): SmartSearchDataPipelineHost["resultItemRenderer"] {
    return super.resultItemRenderer
  }

  set highlightMatches(v: boolean) {
    if (this.#searchResultListInstance) {
      this.#searchResultListInstance.highlightMatches = v
    }
  }
  get highlightMatches(): boolean {
    return this.#searchResultListInstance?.highlightMatches ?? true
  }

  set filterItemRenderer(fn: FilterItemRendererFn | null) {
    if (this.#filterOptionsInstance) {
      this.#filterOptionsInstance.renderFn = fn ?? undefined
    }
  }

  getActiveFilters(): Array<{ field: string; value: string }> {
    return this.#filterOptionsInstance?.getActiveFilters() ?? []
  }

  /* multi-select */
  #addSelectedItem = (result: SearchResult, sourceEvent: Event): void => {
    this.#selectedItems.push(result)
    this.#syncMultiSelectState(sourceEvent)
  }

  #removeSelectedItem = (value: string, sourceEvent?: Event): void => {
    this.#selectedItems = this.#selectedItems.filter((i) => i.value !== value)
    this.#syncMultiSelectState(sourceEvent)
  }

  #clearAllSelectedItems = (): void => {
    this.#selectedItems = []
    this.#syncMultiSelectState()
  }

  #syncMultiSelectState(sourceEvent?: Event): void {
    this.#inputInstance.updateChips(this.#selectedItems)
    this.#searchResultListInstance.setSelectedValues(this.#selectedItems.map((i) => i.value))
    this.#inputInstance.setMultiValue(
      this.#selectedItems.length > 0 ? JSON.stringify(this.#selectedItems.map((i) => i.value)) : null,
    )
    const evt = sourceEvent ?? new Event("ss-multiselect-sync", { bubbles: false, composed: false })
    fireEvent(this, SmartSearchEventNames.MULTISELECT_CHANGE, {
      items: [...this.#selectedItems],
      sourceEvent: evt,
    })
  }

  override handleSelect = (value: string, result: SearchResult, sourceEvent: Event): void => {
    const { multiselect } = this.getAttrs()
    if (multiselect) {
      const alreadySelected = this.#selectedItems.some((i) => i.value === value)
      if (alreadySelected) {
        this.#removeSelectedItem(value, sourceEvent)
      } else {
        this.#addSelectedItem(result, sourceEvent)
      }
      return
    }
    fireEvent(this, SmartSearchEventNames.MENU_SELECT, { value, result, sourceEvent })
    const inputEl = this.getInputEl()
    inputEl.value = result.label
    this.handleMenuClose()
  }

  override handleClear = (): void => {
    const { multiselect } = this.getAttrs()
    if (multiselect) {
      this.#clearAllSelectedItems()
    }
    this.handleMenuClose()
  }

  /* keyboard navigation */
  protected getNavigableItems(): HTMLElement[] {
    return Array.from(
      this.menuInstance.querySelectorAll<HTMLElement>(
        `${SearchResultList.tagName} ${SearchResultItem.tagName}:not([disabled])`,
      ),
    )
  }

  protected onActiveIndexChanged(index: number, items: HTMLElement[]): void {
    for (const item of items) {
      ;(item as HTMLElement & { active: boolean }).active = false
    }
    const activeItem = items[index]
    const inputEl = this.getInputEl()
    if (activeItem) {
      ;(activeItem as HTMLElement & { active: boolean }).active = true
      inputEl.setAttribute("aria-activedescendant", activeItem.id)
      activeItem.scrollIntoView({ block: "nearest" })
    } else {
      inputEl.setAttribute("aria-activedescendant", "")
    }
  }

  /* lifecycle methods */
  protected onDisconnect(): void {
    this.#searchResultListInstance.remove()
    this.#liveRegion.remove()
  }

  protected render(): HTMLElement {
    this.#configureInput()
    this.#searchResultListInstance = new SearchResultList({ onSelect: this.handleSelect })
    this.#configureMenu()
    this.#configureLiveRegion()

    return h("div", { class: SmartSearch.className }, this.#inputInstance, this.menuInstance, this.#liveRegion)
  }

  protected onConnect(): void {
    let menuMinHeight = this.getAttribute("menu-min-height") ?? DefaultSmartSearchAttrs.menuMinHeight
    this.shadowRoot!.adoptedStyleSheets = createStyles([
      menuCustomStyles({ minHeight: menuMinHeight as number | string }),
    ])
    const opts = { signal: this.abort.signal }
    this.addEventListener(SmartSearchEventNames.MENU_CLOSE, this.handleMenuClose as EventListener, opts)
    this.addEventListener(SmartSearchEventNames.MENU_OPEN, this.handleMenuOpen as EventListener, opts)
    this.#inputInstance.inputElement.addEventListener("keydown", this.handleInputKeydown, opts)
    this.menuInstance.addEventListener("pointermove", this.handlePointerMoveOnMenu, opts)

    const attrs = this.getAttrs()
    if (attrs.options?.length) {
      this.options = attrs.options
    }
    this.#searchResultListInstance.highlightMatches = this.getAttribute("highlight-matches") !== "false"
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, _oldValue, newValue)
    if (name === "theme") {
      fireEvent(this, SmartSearchEventNames.THEME_CHANGE, { theme: newValue ?? "auto" })
      return
    }
    if (name === "placeholder" && this.#inputInstance) {
      this.#inputInstance.setAttribute("placeholder", newValue ?? "")
    }
    if (name === "max-chars" && this.#inputInstance) {
      if (newValue !== null) {
        this.#inputInstance.setAttribute("maxlength", newValue)
      } else {
        this.#inputInstance.removeAttribute("maxlength")
      }
    }
    if (name === "options") {
      this.options = newValue ? JSON.parse(newValue) : []
    }
    if (name === "datasource") {
      this.clearCache()
    }
    if (name === "filters" && this.menuInstance) {
      const parsed: FilterOptionData[] = newValue ? JSON.parse(newValue) : []
      if (this.#filterOptionsInstance) {
        this.#filterOptionsInstance.update(parsed)
      } else if (parsed.length) {
        const { filterMultiple } = this.getAttrs()
        this.#filterOptionsInstance = new FilterOptions({
          options: parsed,
          onChange: this.handleFilterChange,
          multiple: filterMultiple,
        })
        this.menuInstance.insertBefore(this.#filterOptionsInstance, this.#searchResultListInstance)
      }
    }
    if (name === "filter-multiple" && this.#filterOptionsInstance) {
      const { filterMultiple } = this.getAttrs()
      this.#filterOptionsInstance.multiple = filterMultiple ?? true
    }
    if (name === "highlight-matches" && this.#searchResultListInstance) {
      this.#searchResultListInstance.highlightMatches = newValue !== "false"
    }
  }
}
