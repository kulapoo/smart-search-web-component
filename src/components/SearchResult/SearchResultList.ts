import { Component } from "@/components/Component"
import { SearchResultItem, type SearchResult } from "@/components/SearchResult/SearchResultItem"
import { highlight } from "@/utils/highlight"
import { groupFlatItems } from "@/utils/group-items"
import { h } from "@/utils/h"

export interface SearchResultGroup<T extends Record<string, unknown> = Record<string, unknown>> {
  label: string
  icon?: string
  options: SearchResult<T>[]
}

export type SearchResults<T extends Record<string, unknown> = Record<string, unknown>> =
  | SearchResult<T>[]
  | SearchResultGroup<T>[]

export function isGroupedResults<T extends Record<string, unknown>>(
  items: SearchResults<T>,
): items is SearchResultGroup<T>[] {
  return items.length > 0 && "options" in items[0]
}

export interface SearchResultListOptions {
  onSelect?: (value: string, result: SearchResult, sourceEvent: Event) => void
}

export class SearchResultList extends Component {
  static tagName = "ss-search-result-list"
  static className = "ss-result-list"

  static #groupCounter = 0

  #onSelect: SearchResultListOptions["onSelect"]
  #itemMap = new Map<string, SearchResultItem>()

  constructor({ onSelect }: SearchResultListOptions) {
    super()
    this.#onSelect = onSelect
  }

  update(items: SearchResults, query: string): void {
    const incoming = new Map<string, SearchResult>()
    if (isGroupedResults(items)) {
      for (const group of items) {
        for (const item of group.options) incoming.set(item.value, item)
      }
    } else {
      for (const item of items as SearchResult[]) incoming.set(item.value, item)
    }

    for (const [value, el] of this.#itemMap) {
      const result = incoming.get(value)
      if (result) {
        el.update(result, query)
      } else {
        this.#itemMap.delete(value)
      }
    }

    for (const [value, result] of incoming) {
      if (!this.#itemMap.has(value)) {
        this.#itemMap.set(value, this.#createItem(result, query))
      }
    }

    this.replaceChildren()
    if (isGroupedResults(items)) {
      for (const group of items) this.#appendGroup(group, query)
    } else {
      const flatItems = items as SearchResult[]
      const hasGroups = flatItems.some((item) => item.group)
      if (hasGroups) {
        for (const group of groupFlatItems(flatItems)) this.#appendGroup(group, query)
      } else {
        for (const item of flatItems) {
          const el = this.#itemMap.get(item.value)
          if (el) this.appendChild(el)
        }
      }
    }
  }

  protected render(): HTMLElement {
    this.classList.add(SearchResultList.className)
    return this
  }

  #appendGroup(group: SearchResultGroup, _query: string): void {
    if (group.label) {
      const groupId = `ss-group-${SearchResultList.#groupCounter++}`
      const header = h("div", { class: "ss-result-group-label", id: groupId, role: "presentation" }, group.label)
      const groupEl = h("div", { role: "group", "aria-labelledby": groupId, class: "ss-result-group" })
      for (const item of group.options) {
        const el = this.#itemMap.get(item.value)
        if (el) groupEl.appendChild(el)
      }

      this.appendChild(header)
      this.appendChild(groupEl)
    } else {
      for (const item of group.options) {
        const el = this.#itemMap.get(item.value)
        if (el) this.appendChild(el)
      }
    }
  }

  #createItem(result: SearchResult, query: string): SearchResultItem {
    const item = new SearchResultItem({ result, onSelect: this.#onSelect })
    item.replaceChildren(highlight(result.label, query))
    return item
  }
}
