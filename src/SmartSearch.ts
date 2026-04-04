import { Component } from "@/components/Component"
import { Input } from "@/components/Input/Input"
import { Menu, type MenuOptions } from "@/components/Menu/Menu"
import { compose } from "@/mixins/compose"
import { DisabledMixin } from "@/mixins/DisabledMixin"
import type { Constructor } from "@/mixins/types"
import { h } from "@/utils/h"
import { SearchResultList, type SearchResults } from "@/components/SearchResult/SearchResultList"
import { smartSearchStyles } from "@/styles/styles"
import { SmartSearchEventHandlerMixin, type SmartSearchEventHandlers } from "@/SmartSearchEventHandlerMixin"
import { DefaultSmartSearchAttrs, SmartSearchEventNames, type SmartSearchAttrs } from "@/SmartSearchConstants"

export { SmartSearchEventNames } from "@/SmartSearchConstants"

const SmartSearchBase = compose(Component, DisabledMixin, SmartSearchEventHandlerMixin) as Constructor<
  Component & SmartSearchEventHandlers
>

export class SmartSearch extends SmartSearchBase {
  static tagName = "ss-smart-search"
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

  protected configureAria(): void {
    this.setAttribute("role", "combobox")
    this.setAttribute("aria-expanded", "false")
    this.setAttribute("aria-autocomplete", "list")
    this.setAttribute("aria-controls", "ss-smart-search-results")
    this.setAttribute("aria-label", "Smart Search")
  }

  /* private methods */
  #getAttrs(): SmartSearchAttrs {
    const boolAttrs = ["clearable"]
    const intAttrs = ["debounce"]

    const attrs = Object.keys(DefaultSmartSearchAttrs).reduce((acc, key) => {
      const attrValue = this.getAttribute(key)
      let finalValue

      if (boolAttrs.includes(key)) {
        finalValue = attrValue === "true"
      } else if (intAttrs.includes(key)) {
        finalValue = attrValue ? parseInt(attrValue) : DefaultSmartSearchAttrs[key as keyof SmartSearchAttrs]
      } else {
        finalValue = attrValue ?? DefaultSmartSearchAttrs[key as keyof SmartSearchAttrs]
      }

      return {
        ...acc,
        [key]: finalValue,
      }
    }, {} as SmartSearchAttrs)

    return attrs
  }

  async #fetchDatasource() {
    const attrs = this.#getAttrs()
    const { datasource } = attrs
    if (!datasource) {
      return
    }
    const data = await new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { value: "1", label: "Result 1" },
          { value: "2", label: "Result 2" },
          { value: "3", label: "Result 3" },
        ] as SearchResults)
      }, 1000)
    })
  }

  /* public methods */
  loadResults(results: SearchResults, query: string): void {
    this.#searchResultListInstance.update(results, query)
  }

  /* lifecycle methods */

  protected render(): HTMLElement {
    const { placeholder, debounce, name } = this.#getAttrs()

    const inputOpts = {
      name: name ?? "search",
      onInput: this.handleInput,
      onClear: this.handleClear,
    }
    this.#inputInstance = new Input(inputOpts)

    if (placeholder) this.#inputInstance.setAttribute("placeholder", placeholder)
    if (debounce !== undefined) this.#inputInstance.setAttribute("debounce", String(debounce))

    this.#inputInstance.setAttribute("clearable", "")

    const menuOpts = { anchor: this.#inputInstance, onClose: this.handleMenuClose } as MenuOptions
    this.menuInstance = new Menu(menuOpts)

    this.#searchResultListInstance = new SearchResultList({ onSelect: this.handleSelect })

    this.menuInstance.appendChild(this.#searchResultListInstance)
    this.menuInstance.show()
    const rootChildren = [this.#inputInstance, this.menuInstance]

    return h("div", { class: SmartSearch.className }, ...rootChildren)
  }

  protected onConnect(): void {
    this.shadowRoot!.adoptedStyleSheets = smartSearchStyles
    this.addEventListener(SmartSearchEventNames.MENU_CLOSE, this.handleMenuClose as EventListener)
    this.addEventListener(SmartSearchEventNames.MENU_OPEN, this.handleMenuOpen as EventListener)
  }

  protected onDisconnect(): void {
    this.removeEventListener(SmartSearchEventNames.MENU_CLOSE, this.handleMenuClose as EventListener)
    this.removeEventListener(SmartSearchEventNames.MENU_OPEN, this.handleMenuOpen as EventListener)
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (name === "placeholder" && this.#inputInstance) {
      this.#inputInstance.setAttribute("placeholder", newValue ?? "")
    }
  }
}
