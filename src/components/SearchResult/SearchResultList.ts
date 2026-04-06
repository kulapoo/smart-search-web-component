import { Component } from "@/components/Component"
import { SearchResultItem, type SearchResult } from "@/components/SearchResult/SearchResultItem"
import type { ResultItemRendererFn } from "@/types/datasource"
import { highlight } from "@/utils/highlight"
import { groupFlatItems } from "@/utils/group-items"
import { h } from "@/utils/h"
import { Check } from "lucide"
import type { IconNode } from "lucide"
import { createIcon } from "@/utils/icon"

export interface SearchResultGroup<T extends Record<string, unknown> = Record<string, unknown>> {
  label: string
  icon?: IconNode
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
  #selectedValues: Set<string> = new Set()
  #highlightMatches = true

  set resultItemRenderer(fn: ResultItemRendererFn | null) {
    this.#resultItemRenderer = fn
  }
  get resultItemRenderer(): ResultItemRendererFn | null {
    return this.#resultItemRenderer
  }

  set highlightMatches(v: boolean) {
    this.#highlightMatches = v
  }
  get highlightMatches(): boolean {
    return this.#highlightMatches
  }

  setSelectedValues(values: string[]): void {
    this.#selectedValues = new Set(values)
    for (const item of this.querySelectorAll<SearchResultItem>(SearchResultItem.tagName)) {
      const isSelected = this.#selectedValues.has(item.value)
      item.selected = isSelected
      const existingCheck = item.querySelector("svg[data-ss-check]")
      if (isSelected && !existingCheck) {
        const check = createIcon(Check, 14)
        check.setAttribute("data-ss-check", "")
        item.appendChild(check)
      } else if (!isSelected && existingCheck) {
        existingCheck.remove()
      }
    }
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
      const labelChildren: (Node | string)[] = []
      if (group.icon) labelChildren.push(createIcon(group.icon, 14))
      labelChildren.push(group.label)
      const header = h("div", { class: "ss-result-group-label", id: groupId, role: "presentation" }, ...labelChildren)
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
    return this.#highlightMatches ? highlight(result.label, searchTerm) : document.createTextNode(result.label)
  }

  #createItem(result: SearchResult, searchTerm: string): SearchResultItem {
    const item = new SearchResultItem({
      result,
      onSelect: this.#onSelect,
      selected: this.#selectedValues.has(result.value),
    })
    const content = this.#renderContent(result, searchTerm)
    const labelSpan = document.createElement("span")
    labelSpan.appendChild(typeof content === "string" ? document.createTextNode(content) : content)
    const children: Node[] = []
    if (result.icon) children.push(createIcon(result.icon, 16))
    children.push(labelSpan)
    if (this.#selectedValues.has(result.value)) {
      const check = createIcon(Check, 14)
      check.setAttribute("data-ss-check", "")
      children.push(check)
    }
    item.replaceChildren(...children)
    return item
  }
}
