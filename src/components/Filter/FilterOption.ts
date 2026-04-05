import { Component } from "@/components/Component"
import { compose } from "@/mixins/compose"
import { ActiveMixin } from "@/mixins/ActiveMixin"
import type { Constructor } from "@/mixins/types"
import type { FilterItemRendererFn } from "@/types/datasource"

export interface FilterOptionData {
  label: string
  value: string
  field: string
  metadata?: Record<string, unknown>
}

export interface FilterOptionConfig extends FilterOptionData {
  onChange: (e: CustomEvent) => void
  renderFn?: FilterItemRendererFn
}

const FilterOptionBase = compose(Component, ActiveMixin) as Constructor<Component>

export class FilterOption extends FilterOptionBase {
  static tagName = "ss-filter-option"
  static className = "ss-filter-option"

  declare active: boolean

  static get observedAttributes(): string[] {
    return ["label", "value", "type", "active"]
  }

  #onChange: FilterOptionConfig["onChange"]
  #metadata: FilterOptionConfig["metadata"]
  #renderFn: FilterItemRendererFn | undefined

  constructor({ label, value, field, metadata, onChange, renderFn }: FilterOptionConfig) {
    super()
    this.#onChange = onChange
    this.#metadata = metadata
    this.#renderFn = renderFn
    this.setAttribute("label", label)
    this.setAttribute("value", value)
    this.setAttribute("field", field)
    this.id = `filter-option-${value}`
    this.classList.add(FilterOption.className)
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.#metadata
  }

  set renderFn(fn: FilterItemRendererFn | undefined) {
    this.#renderFn = fn
    this.#applyRender()
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value)
    if (name === "label") {
      this.#applyRender()
    } else if (name === "value") {
      this.id = `filter-option-${value}`
    }
  }

  #applyRender(): void {
    const data: FilterOptionData = {
      label: this.getAttribute("label") ?? "",
      value: this.getAttribute("value") ?? "",
      field: this.getAttribute("field") ?? "",
      metadata: this.#metadata,
    }
    if (this.#renderFn) {
      const content = this.#renderFn(data)
      this.replaceChildren(typeof content === "string" ? document.createTextNode(content) : content)
    } else {
      this.textContent = data.label
    }
  }

  protected configureAria(): void {
    this.setAttribute("role", "option")
    this.setAttribute("tabindex", "-1")
  }

  protected onConnect(): void {
    this.addEventListener("click", this.#handleChange, { signal: this.abort.signal })
  }

  #handleChange = (e: Event): void => {
    this.#onChange(e as CustomEvent<{ field: string; value: string }>)
  }

  protected render(): HTMLElement {
    this.#applyRender()
    return this
  }
}
