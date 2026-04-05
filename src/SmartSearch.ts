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
import { FilterOption } from "@/components/Filter/FilterOption"
import { FilterOptions } from "@/components/Filter/FilterOptions"
import { SearchResultItem } from "@/components/SearchResult/SearchResultItem"
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

  constructor() {
    super()
    this.shadowMode = "open"
  }

  static get observedAttributes(): string[] {
    return Object.keys(DefaultSmartSearchAttrs)
  }

  // elements instances
  #inputInstance!: Input
  menuInstance!: Menu
  #searchResultListInstance!: SearchResultList
  #filterOptionsInstance: FilterOptions | null = null
  #liveRegion!: HTMLElement

  protected configureAria(): void {
    this.setAttribute("aria-label", "Smart Search")
  }

  getInputEl(): HTMLInputElement {
    return this.#inputInstance.inputElement
  }

  #configureInput() {
    const { placeholder, debounce, name, clearable } = this.getAttrs()

    const inputOpts = {
      name: name ?? "search",
      onInput: this.handleInput,
      onBlur: this.handleInputBlur,
      onFocus: this.handleInputFocus,
      onClear: this.handleClear,
    }
    this.#inputInstance = new Input(inputOpts)

    if (placeholder) this.#inputInstance.setAttribute("placeholder", placeholder)
    if (debounce !== undefined) this.#inputInstance.setAttribute("debounce", String(debounce))

    this.#inputInstance.setAttribute("clearable", clearable ? "true" : "")
  }

  #configureMenu() {
    const { menuMaxHeight, menuOffset, menuPlacement, menuMatchWidth, closeOnEscape, closeOnClickOutside, filters } =
      this.getAttrs()
    const menuOpts: MenuOptions = {
      anchor: this.#inputInstance,
      onClose: this.handleMenuClose,
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
        onChange: this.#handleFilterChange,
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
    const { openMenuOnLoadResults } = this.getAttrs()

    this.#searchResultListInstance.update(results, searchTerm)
    const count = isGroupedResults(results)
      ? results.reduce((sum, group) => sum + group.options.length, 0)
      : results.length
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

  set filterItemRenderer(fn: FilterItemRendererFn | null) {
    if (this.#filterOptionsInstance) {
      this.#filterOptionsInstance.renderFn = fn ?? undefined
    }
  }

  getActiveFilters(): Array<{ field: string; value: string }> {
    return this.#filterOptionsInstance?.getActiveFilters() ?? []
  }

  #handleFilterChange = (_e: CustomEvent): void => {
    const activeFilters = this.getActiveFilters()
    fireEvent(this, SmartSearchEventNames.FILTER_CHANGE, { filters: activeFilters })
    const searchTerm = this.getInputEl().value
    this.loadData(searchTerm, activeFilters)
  }

  /* keyboard navigation */
  protected getNavigableItems(): HTMLElement[] {
    return Array.from(
      this.menuInstance.querySelectorAll<HTMLElement>(
        `${SearchResultList.tagName} ${SearchResultItem.tagName}:not([disabled]), ${FilterOption.tagName}:not([disabled])`,
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

  #onMenuPointerMove = (): void => {
    this.menuInstance.removeAttribute("data-keyboard-nav")
  }

  #handleInputKeydown = (e: KeyboardEvent): void => {
    if (!this.menuInstance.isOpen) return

    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Home":
      case "End":
        this.handleKeyboardNav(e)
        this.menuInstance.setAttribute("data-keyboard-nav", "")
        break
      case "Enter": {
        e.preventDefault()
        const items = this.getNavigableItems()
        const active = items[this.activeIndex]
        active?.click()
        break
      }
      case "Tab":
        this.handleMenuClose()
        break
      case "Escape":
        e.preventDefault()
        this.handleMenuClose()
        break
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
    this.shadowRoot!.adoptedStyleSheets = createStyles([menuCustomStyles({ minHeight: menuMinHeight as number | string })])
    const opts = { signal: this.abort.signal }
    this.addEventListener(SmartSearchEventNames.MENU_CLOSE, this.handleMenuClose as EventListener, opts)
    this.addEventListener(SmartSearchEventNames.MENU_OPEN, this.handleMenuOpen as EventListener, opts)
    this.#inputInstance.inputElement.addEventListener("keydown", this.#handleInputKeydown, opts)
    this.menuInstance.addEventListener("pointermove", this.#onMenuPointerMove, opts)

    const attrs = this.getAttrs()
    if (attrs.options?.length) {
      this.options = attrs.options
    }
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (name === "placeholder" && this.#inputInstance) {
      this.#inputInstance.setAttribute("placeholder", newValue ?? "")
    }
    if (name === "options") {
      this.options = newValue ? JSON.parse(newValue) : []
    }
    if (name === "datasource") {
      this.clearCache()
    }
    if (name === "filters" && this.#filterOptionsInstance) {
      this.#filterOptionsInstance.update(newValue ? JSON.parse(newValue) : [])
    }
  }
}
