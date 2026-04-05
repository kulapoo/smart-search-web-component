import { Component } from "@/components/Component"
import { SearchResultItem, type SearchResult } from "@/components/SearchResult/SearchResultItem"
import type { ResultItemRendererFn } from "@/types/datasource"
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
  #resultItemRenderer: ResultItemRendererFn | null = null

  set resultItemRenderer(fn: ResultItemRendererFn | null) {
    this.#resultItemRenderer = fn
  }
  get resultItemRenderer(): ResultItemRendererFn | null {
    return this.#resultItemRenderer
  }

  constructor({ onSelect }: SearchResultListOptions) {
    super()
    this.#onSelect = onSelect
  }

  update(items: SearchResults, searchTerm: string): void {
    this.replaceChildren()

    const groups = isGroupedResults(items)
      ? items
      : (items as SearchResult[]).some((item) => item.group)
        ? groupFlatItems(items as SearchResult[])
        : null

    if (groups) {
      for (const group of groups) this.#appendGroup(group, searchTerm)
    } else {
      for (const item of items as SearchResult[]) {
        this.appendChild(this.#createItem(item, searchTerm))
      }
    }
  }

  protected render(): HTMLElement {
    this.classList.add(SearchResultList.className)
    return this
  }

  #appendGroup(group: SearchResultGroup, searchTerm: string): void {
    if (group.label) {
      const groupId = `ss-group-${SearchResultList.#groupCounter++}`
      const header = h("div", { class: "ss-result-group-label", id: groupId, role: "presentation" }, group.label)
      const groupEl = h("div", { role: "group", "aria-labelledby": groupId, class: "ss-result-group" })
      for (const item of group.options) {
        groupEl.appendChild(this.#createItem(item, searchTerm))
      }
      this.appendChild(header)
      this.appendChild(groupEl)
    } else {
      for (const item of group.options) {
        this.appendChild(this.#createItem(item, searchTerm))
      }
    }
  }

  #renderContent(result: SearchResult, searchTerm: string): Node {
    if (this.#resultItemRenderer) {
      const content = this.#resultItemRenderer(result, searchTerm)
      return typeof content === "string" ? document.createTextNode(content) : content
    }
    return highlight(result.label, searchTerm)
  }

  #createItem(result: SearchResult, searchTerm: string): SearchResultItem {
    const item = new SearchResultItem({ result, onSelect: this.#onSelect })
    item.replaceChildren(this.#renderContent(result, searchTerm))
    return item
  }
}
