import { describe, test, expect, vi } from "vitest"
import { mountSearchResultList } from "../helpers"
import { isGroupedResults } from "@/components/SearchResult/SearchResultList"
import { SearchResultItem } from "@/components/SearchResult/SearchResultItem"
import type { SearchResult } from "@/components/SearchResult/SearchResultItem"

describe("SearchResultList", () => {
  describe("rendering", () => {
    test("renders as an empty container with ss-result-list class", () => {
      const el = mountSearchResultList()
      expect(el.classList.contains("ss-result-list")).toBe(true)
      expect(el.children.length).toBe(0)
    })
  })

  describe("isGroupedResults()", () => {
    test("returns true for an array of grouped result objects", () => {
      const grouped = [{ label: "Fruit", options: [{ label: "Apple", value: "a" }] }]
      expect(isGroupedResults(grouped)).toBe(true)
    })

    test("returns false for a flat array of result objects", () => {
      const flat: SearchResult[] = [
        { label: "Apple", value: "a" },
        { label: "Banana", value: "b" },
      ]
      expect(isGroupedResults(flat)).toBe(false)
    })

    test("returns false for an empty array", () => {
      expect(isGroupedResults([])).toBe(false)
    })
  })

  describe("update() — flat results", () => {
    test("creates a SearchResultItem for each flat result", () => {
      const el = mountSearchResultList()
      const items: SearchResult[] = [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
        { label: "C", value: "c" },
      ]
      el.update(items, "")
      expect(el.querySelectorAll(SearchResultItem.tagName!).length).toBe(3)
    })

    test("highlights each item's label with the search term", () => {
      const el = mountSearchResultList()
      el.update([{ label: "Apple", value: "apple" }], "pp")
      const item = el.querySelector(SearchResultItem.tagName!)
      const mark = item?.querySelector("mark.ss-highlight")
      expect(mark?.textContent).toBe("pp")
    })

    test("clears previous items on each call", () => {
      const el = mountSearchResultList()
      el.update([{ label: "One", value: "1" }], "")
      expect(el.querySelectorAll(SearchResultItem.tagName!).length).toBe(1)
      el.update(
        [
          { label: "A", value: "a" },
          { label: "B", value: "b" },
        ],
        "",
      )
      expect(el.querySelectorAll(SearchResultItem.tagName!).length).toBe(2)
    })

    test("auto-groups flat items that have a group field", () => {
      const el = mountSearchResultList()
      el.update(
        [
          { label: "Apple", value: "a", group: "Produce" },
          { label: "Carrot", value: "c", group: "Produce" },
        ],
        "",
      )
      const header = el.querySelector(".ss-result-group-label")
      expect(header?.getAttribute("role")).toBe("presentation")
      expect(header?.textContent).toContain("Produce")
      const group = el.querySelector(".ss-result-group")
      expect(group?.getAttribute("role")).toBe("group")
      expect(el.querySelectorAll(SearchResultItem.tagName!).length).toBe(2)
    })
  })

  describe("update() — grouped results", () => {
    test("creates group headers with role=presentation", () => {
      const el = mountSearchResultList()
      el.update(
        [
          {
            label: "Section A",
            options: [{ label: "Item", value: "i" }],
          },
        ],
        "",
      )
      const header = el.querySelector(".ss-result-group-label")
      expect(header?.getAttribute("role")).toBe("presentation")
      expect(header?.textContent).toContain("Section A")
    })

    test("creates group containers with role=group", () => {
      const el = mountSearchResultList()
      el.update(
        [
          {
            label: "G",
            options: [{ label: "X", value: "x" }],
          },
        ],
        "",
      )
      expect(el.querySelector(".ss-result-group")?.getAttribute("role")).toBe("group")
    })

    test("group container has aria-labelledby pointing to header id", () => {
      const el = mountSearchResultList()
      el.update(
        [
          {
            label: "Labeled",
            options: [{ label: "Opt", value: "o" }],
          },
        ],
        "",
      )
      const header = el.querySelector(".ss-result-group-label")
      const group = el.querySelector(".ss-result-group")
      const id = header?.id
      expect(id).toBeTruthy()
      expect(group?.getAttribute("aria-labelledby")).toBe(id)
    })

    test("items without a label go into an unnamed group (no header)", () => {
      const el = mountSearchResultList()
      el.update(
        [
          {
            label: "",
            options: [
              { label: "Loose", value: "l" },
              { label: "Also", value: "a" },
            ],
          },
        ],
        "",
      )
      expect(el.querySelector(".ss-result-group-label")).toBeNull()
      expect(el.querySelector(".ss-result-group")).toBeNull()
      expect(el.querySelectorAll(SearchResultItem.tagName!).length).toBe(2)
    })

    test("preserves group order across calls", () => {
      const el = mountSearchResultList()
      const data = [
        { label: "Alpha", options: [{ label: "A1", value: "a1" }] },
        { label: "Beta", options: [{ label: "B1", value: "b1" }] },
      ]
      el.update(data, "")
      const firstPass = [...el.querySelectorAll(".ss-result-group-label")].map((n) => n.textContent?.trim())
      el.update(data, "")
      const secondPass = [...el.querySelectorAll(".ss-result-group-label")].map((n) => n.textContent?.trim())
      expect(firstPass).toEqual(["Alpha", "Beta"])
      expect(secondPass).toEqual(["Alpha", "Beta"])
    })
  })

  describe("highlightMatches", () => {
    test("defaults to true", () => {
      const el = mountSearchResultList()
      expect(el.highlightMatches).toBe(true)
    })

    test("highlights labels by default", () => {
      const el = mountSearchResultList()
      el.update([{ label: "Apple", value: "apple" }], "pp")
      const item = el.querySelector(SearchResultItem.tagName!)
      expect(item?.querySelector("mark.ss-highlight")).not.toBeNull()
    })

    test("renders plain text when set to false", () => {
      const el = mountSearchResultList()
      el.highlightMatches = false
      el.update([{ label: "Apple", value: "apple" }], "pp")
      const item = el.querySelector(SearchResultItem.tagName!)
      expect(item?.querySelector("mark.ss-highlight")).toBeNull()
      expect(item?.querySelector("span")?.textContent).toBe("Apple")
    })

    test("setter updates the getter value", () => {
      const el = mountSearchResultList()
      el.highlightMatches = false
      expect(el.highlightMatches).toBe(false)
    })

    test("re-enabling highlight after disabling it restores marks", () => {
      const el = mountSearchResultList()
      el.highlightMatches = false
      el.update([{ label: "Apple", value: "apple" }], "pp")
      el.highlightMatches = true
      el.update([{ label: "Apple", value: "apple" }], "pp")
      const item = el.querySelector(SearchResultItem.tagName!)
      expect(item?.querySelector("mark.ss-highlight")).not.toBeNull()
    })
  })

  describe("resultItemRenderer", () => {
    test("getter returns null by default", () => {
      const el = mountSearchResultList()
      expect(el.resultItemRenderer).toBeNull()
    })

    test("setter stores the renderer function", () => {
      const el = mountSearchResultList()
      const fn = vi.fn(() => document.createTextNode("x"))
      el.resultItemRenderer = fn
      expect(el.resultItemRenderer).toBe(fn)
    })

    test("custom renderer is used to render item content", () => {
      const el = mountSearchResultList()
      const custom = document.createElement("em")
      custom.textContent = "custom"
      el.resultItemRenderer = () => custom
      el.update([{ label: "Ignored for display", value: "v" }], "")
      const item = el.querySelector(SearchResultItem.tagName!)
      expect(item?.querySelector("em")?.textContent).toBe("custom")
    })

    test("string return value from renderer is converted to text node", () => {
      const el = mountSearchResultList()
      el.resultItemRenderer = () => "plain text"
      el.update([{ label: "Label", value: "v" }], "")
      const item = el.querySelector(SearchResultItem.tagName!)
      const span = item?.querySelector("span")
      expect(span?.textContent).toBe("plain text")
      expect(span?.childNodes.length).toBe(1)
      expect(span?.firstChild?.nodeType).toBe(Node.TEXT_NODE)
    })
  })

  describe("onSelect callback", () => {
    test("onSelect is forwarded to each SearchResultItem", () => {
      const onSelect = vi.fn()
      const el = mountSearchResultList({ onSelect })
      const result: SearchResult = { label: "Pick me", value: "pick" }
      el.update([result], "")
      const item = el.querySelector(SearchResultItem.tagName!) as SearchResultItem
      item.click()
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenCalledWith("pick", result, expect.any(MouseEvent))
    })
  })
})
