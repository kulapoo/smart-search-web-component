import { Component } from "@/components/Component"

export interface FilterOptionConfig {
  label: string
  value: string
  type: "text" | "checkbox" | "radio" | "select" | "multi-select"
  metadata?: Record<string, unknown>
  onChange: (e: Event) => void
}

export class FilterOption extends Component {
  static tagName = "ss-filter-option"
  static className = "ss-filter-option"

  static get observedAttributes(): string[] {
    return ["label", "value", "type"]
  }

  #onChange: FilterOptionConfig["onChange"]
  #metadata: FilterOptionConfig["metadata"]

  constructor({ label, value, type, metadata, onChange }: FilterOptionConfig) {
    super()
    this.#onChange = onChange
    this.#metadata = metadata
    this.setAttribute("label", label)
    this.setAttribute("value", value)
    this.setAttribute("type", type)
    this.id = `filter-option-${value}`
    this.classList.add(FilterOption.className)
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.#metadata
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === "label") {
      this.textContent = value ?? ""
    } else if (name === "value") {
      this.id = `filter-option-${value}`
    }
    // type: CSS/attr selectors handle styling, no DOM update needed
  }

  protected configureAria(): void {
    this.setAttribute("role", "option")
    this.setAttribute("tabindex", "-1")
  }

  protected onConnect(): void {
    this.addEventListener("click", this.#handleChange)
  }

  protected onDisconnect(): void {
    this.removeEventListener("click", this.#handleChange)
  }

  #handleChange = (e: Event): void => {
    this.#onChange(e)
  }

  protected render(): HTMLElement {
    this.textContent = this.getAttribute("label") ?? ""
    return this
  }
}
