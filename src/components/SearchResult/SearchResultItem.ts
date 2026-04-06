import { compose } from "@/mixins/compose"
import { DisabledMixin } from "@/mixins/DisabledMixin"
import { ActiveMixin } from "@/mixins/ActiveMixin"
import { Component } from "@/components/Component"
import type { Constructor } from "@/mixins/types"
import type { IconNode } from "lucide"

export interface SearchResult<T extends Record<string, unknown> = Record<string, unknown>> {
  value: string
  label: string
  description?: string
  icon?: IconNode
  group?: string
  type?: string
  disabled?: boolean
  metadata?: T
}

export interface SearchResultItemOptions {
  result: SearchResult
  selected?: boolean
  onSelect?: (value: string, result: SearchResult, sourceEvent: Event) => void
}

const SearchResultItemBase = compose(Component, DisabledMixin, ActiveMixin) as Constructor<Component>

export class SearchResultItem extends SearchResultItemBase {
  static tagName = "ss-search-result-item"
  static #counter = 0

  declare disabled: boolean
  declare active: boolean

  #result: SearchResult
  #onSelect: SearchResultItemOptions["onSelect"]

  get selected(): boolean {
    return this.hasAttribute("selected")
  }

  set selected(value: boolean) {
    if (value) {
      this.setAttribute("selected", "")
    } else {
      this.removeAttribute("selected")
    }
  }

  constructor({ result, selected, onSelect }: SearchResultItemOptions) {
    super()
    this.#result = result
    this.#onSelect = onSelect
    if (result.disabled) this.disabled = true
    if (selected) this.selected = true
  }

  get value(): string {
    return this.#result.value
  }

  update(result: SearchResult): void {
    this.#result = result
    this.disabled = result.disabled ?? false
  }

  protected configureAria(): void {
    this.setAttribute("role", "option")
    this.setAttribute("tabindex", "-1")
  }

  protected onConnect(): void {
    this.id = this.id || `ss-result-item-${SearchResultItem.#counter++}`
    this.configureAria()
    this.addEventListener("click", this.#onClick)
  }

  #onClick = (event: Event) => {
    if (this.disabled) return
    this.#onSelect?.(this.#result.value, this.#result, event)
  }

  protected render(): HTMLElement {
    return this
  }
}
