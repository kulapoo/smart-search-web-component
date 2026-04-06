import type { SearchResult } from "@/components/SearchResult/SearchResultItem"

export interface FireOptions {
  bubbles?: boolean
  composed?: boolean
  cancelable?: boolean
}

/** Detail payload of the `ss-select` custom event. */
export interface SearchSelectDetail<T extends Record<string, unknown> = Record<string, unknown>> {
  value: string
  result: SearchResult<T>
  sourceEvent: Event
}

/** Detail payload of the `ss-multiselect-change` custom event. */
export interface MultiSelectDetail<T extends Record<string, unknown> = Record<string, unknown>> {
  items: SearchResult<T>[]
  sourceEvent: Event
}

const defaults: FireOptions = { bubbles: true, composed: true, cancelable: false }

export function fireEvent(el: HTMLElement, name: string, detail?: unknown, options?: FireOptions): boolean {
  const opts = options ? { ...defaults, ...options } : defaults
  return el.dispatchEvent(new CustomEvent(name, { ...opts, detail }))
}
