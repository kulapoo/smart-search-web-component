import { Component } from "@/components/Component"
import { Input } from "@/components/Input/Input"
import { Menu, type MenuOptions } from "@/components/Menu/Menu"
import { compose } from "@/mixins/compose"
import { DisabledMixin } from "@/mixins/DisabledMixin"
import { DataPipelineMixin, type DataPipelineHost } from "@/mixins/DataPipelineMixin"
import { KeyboardNavMixin, type KeyboardNavHost } from "@/mixins/KeyboardNavMixin"
import type { Constructor } from "@/mixins/types"
import { h } from "@/utils/h"
import { FilterOption } from "@/components/Filter/FilterOption"
import { SearchResultItem } from "@/components/SearchResult/SearchResultItem"
import { SearchResultList, type SearchResults, isGroupedResults } from "@/components/SearchResult/SearchResultList"
import { createStyles } from "@/styles/styles"
import { SmartSearchEventHandlerMixin, type SmartSearchEventHandlers } from "@/SmartSearchEventHandlerMixin"
import {
  DefaultSmartSearchAttrs,
  SmartSearchConstraintsAttrs,
  SmartSearchEventNames,
  type SmartSearchAttrs,
} from "@/SmartSearchConstants"
import { menuCustomStyles } from "./components/Menu/Menu.styles"
import { toCamelCase } from "./utils/toCamelCase"

export { SmartSearchEventNames } from "@/SmartSearchConstants"

const SmartSearchBase = compose(
  Component,
  DisabledMixin,
  DataPipelineMixin,
  SmartSearchEventHandlerMixin,
  KeyboardNavMixin,
) as Constructor<Component & DataPipelineHost & SmartSearchEventHandlers & KeyboardNavHost>

export interface WithLoadData {
  loadData(query?: string): Promise<void>
}

export interface WithGetAttrs {
  getAttrs(): SmartSearchAttrs
}

export class SmartSearch extends SmartSearchBase implements WithLoadData, WithGetAttrs {
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
    const { menuMaxHeight, menuOffset, menuPlacement, menuMatchWidth, closeOnEscape, closeOnClickOutside } =
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

  loadResults(results: SearchResults, query: string): void {
    this.#searchResultListInstance.update(results, query)
    const count = this.#countResults(results)
    this.menuInstance.empty = count === 0
    this.menuInstance.loading = false
    this.#announce(count === 0 ? "No results found" : `${count} result${count === 1 ? "" : "s"} available`)
  }

  #countResults(results: SearchResults): number {
    if (!results.length) return 0
    if (isGroupedResults(results)) {
      return results.reduce((sum, group) => sum + group.options.length, 0)
    }
    return results.length
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

  #handleInputKeydown = (e: KeyboardEvent): void => {
    if (!this.menuInstance.isOpen) return

    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Home":
      case "End":
        this.handleKeyboardNav(e)
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
    const menuMinHeight =
      parseInt(this.getAttribute("menu-min-height") ?? "0") || (DefaultSmartSearchAttrs.menuMinHeight as number)
    this.shadowRoot!.adoptedStyleSheets = createStyles([menuCustomStyles({ minHeight: menuMinHeight })])
    const opts = { signal: this.abort.signal }
    this.addEventListener(SmartSearchEventNames.MENU_CLOSE, this.handleMenuClose as EventListener, opts)
    this.addEventListener(SmartSearchEventNames.MENU_OPEN, this.handleMenuOpen as EventListener, opts)
    this.#inputInstance.inputElement.addEventListener("keydown", this.#handleInputKeydown, opts)

    const attrs = this.getAttrs()
    if (attrs.options?.length) {
      this.options = attrs.options
    }
  }

  override set resultRenderer(fn: DataPipelineHost["resultRenderer"]) {
    super.resultRenderer = fn
    if (this.#searchResultListInstance) {
      this.#searchResultListInstance.resultRenderer = fn
    }
  }
  override get resultRenderer(): DataPipelineHost["resultRenderer"] {
    return super.resultRenderer
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
  }
}
