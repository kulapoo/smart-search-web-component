import { Component } from "@/components/Component"
import { FilterOption, type FilterOptionConfig } from "./FilterOption"

export interface FilterOptionsOptions {
  options: FilterOptionConfig[]
  onChange: (e: Event) => void
}

export class FilterOptions extends Component {
  static tagName = "ss-filter-options"
  static className = "ss-filter-options"

  #onChange: FilterOptionsOptions["onChange"]
  #itemMap = new Map<string, FilterOption>()

  constructor({ options, onChange }: FilterOptionsOptions) {
    super()
    this.#onChange = onChange
    for (const option of options) {
      this.#itemMap.set(option.value, new FilterOption({ ...option, onChange }))
    }
  }

  update(options: FilterOptionConfig[]): void {
    const incoming = new Map(options.map((o) => [o.value, o]))

    // Remove stale
    for (const [value] of this.#itemMap) {
      if (!incoming.has(value)) this.#itemMap.delete(value)
    }

    // Update existing, create new
    for (const [value, config] of incoming) {
      if (this.#itemMap.has(value)) {
        this.#itemMap.get(value)!.setAttribute("label", config.label)
        this.#itemMap.get(value)!.setAttribute("type", config.type)
      } else {
        this.#itemMap.set(value, new FilterOption({ ...config, onChange: this.#onChange }))
      }
    }

    // Rebuild DOM in order
    this.replaceChildren()
    for (const option of options) {
      const el = this.#itemMap.get(option.value)
      if (el) this.appendChild(el)
    }
  }

  protected configureAria(): void {
    this.setAttribute("role", "group")
    this.setAttribute("aria-label", "Filters")
  }

  protected render(): HTMLElement {
    this.classList.add(FilterOptions.className)
    for (const el of this.#itemMap.values()) {
      this.appendChild(el)
    }
    return this
  }
}
