import { Component } from "@/components/Component"
import { FilterOption, type FilterOptionData } from "./FilterOption"
import type { FilterItemRendererFn } from "@/types/datasource"

export interface FilterOptionsOptions {
  options: FilterOptionData[]
  onChange: (e: CustomEvent) => void
  renderFn?: FilterItemRendererFn
  multiple?: boolean
}

export class FilterOptions extends Component {
  static tagName = "ss-filter-options"
  static className = "ss-filter-options"
  #renderFn: FilterItemRendererFn | undefined
  #selected: string[] = []
  #options: FilterOptionData[] = []
  #multiple: boolean

  #onChange: FilterOptionsOptions["onChange"]
  constructor({ options, onChange, renderFn, multiple }: FilterOptionsOptions) {
    super()
    this.#renderFn = renderFn
    this.#onChange = onChange
    this.#multiple = multiple ?? true
    this.update(options)
  }

  get multiple(): boolean {
    return this.#multiple
  }

  set multiple(value: boolean) {
    this.#multiple = value
    this.setAttribute("aria-multiselectable", String(value))
    if (!value && this.#selected.length > 1) {
      const kept = this.#selected[this.#selected.length - 1]
      this.#selected = [kept]
      for (const child of this.querySelectorAll<FilterOption>(FilterOption.tagName)) {
        child.active = child.getAttribute("value") === kept
      }
    }
  }

  #handleChange = (e: CustomEvent) => {
    const el = e.currentTarget as FilterOption
    const value = el.getAttribute("value") ?? ""
    if (this.#multiple) {
      if (this.#selected.includes(value)) {
        this.#selected = this.#selected.filter((v) => v !== value)
        el.active = false
      } else {
        this.#selected.push(value)
        el.active = true
      }
    } else {
      const wasActive = this.#selected.includes(value)
      for (const child of this.querySelectorAll<FilterOption>(FilterOption.tagName)) {
        child.active = false
      }
      if (wasActive) {
        this.#selected = []
      } else {
        this.#selected = [value]
        el.active = true
      }
    }
    this.#onChange(new CustomEvent("change", { detail: { selected: this.#selected } }))
  }

  set renderFn(fn: FilterItemRendererFn | undefined) {
    this.#renderFn = fn
    this.update(this.#options)
  }

  getActiveFilters(): Array<{ field: string; value: string }> {
    return this.#options
      .filter((o) => this.#selected.includes(o.value))
      .map((o) => ({ field: o.field, value: o.value }))
  }

  update(options: FilterOptionData[]): void {
    this.#options = options
    this.replaceChildren(
      ...options.map((o) => {
        const el = new FilterOption({ ...o, onChange: this.#handleChange, renderFn: this.#renderFn })
        el.active = this.#selected.includes(o.value)
        return el
      }),
    )
  }

  protected configureAria(): void {
    this.setAttribute("role", "group")
    this.setAttribute("aria-label", "Filters")
    this.setAttribute("aria-multiselectable", String(this.#multiple))
  }

  protected render(): HTMLElement {
    this.classList.add(FilterOptions.className)
    return this
  }
}
