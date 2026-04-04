import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import type { SearchResultGroup } from "@/components/SearchResult/SearchResultList"

/**
 * Groups a flat array of SearchResult items by their `group` field.
 * Items without a `group` are placed in an unnamed group at the end.
 * Insertion order of group names is preserved.
 */
export function groupFlatItems<T extends Record<string, unknown>>(items: SearchResult<T>[]): SearchResultGroup<T>[] {
  const groupMap = new Map<string, SearchResult<T>[]>()
  const ungrouped: SearchResult<T>[] = []

  for (const item of items) {
    if (item.group) {
      const bucket = groupMap.get(item.group)
      if (bucket) {
        bucket.push(item)
      } else {
        groupMap.set(item.group, [item])
      }
    } else {
      ungrouped.push(item)
    }
  }

  const groups: SearchResultGroup<T>[] = []
  for (const [label, options] of groupMap) {
    groups.push({ label, options })
  }
  if (ungrouped.length > 0) {
    groups.push({ label: "", options: ungrouped })
  }

  return groups
}
