import { describe, test, expect, vi, afterEach, beforeEach } from "vitest"

import { DefaultSmartSearchAttrs } from "@/SmartSearchConstants"
import { SmartSearch, SmartSearchEventNames } from "@/SmartSearch"
import { FilterOption } from "@/components/Filter/FilterOption"
import { FilterOptions } from "@/components/Filter/FilterOptions"
import { Input } from "@/components/Input/Input"
import { Menu } from "@/components/Menu/Menu"
import { SearchResultList } from "@/components/SearchResult/SearchResultList"
import { SearchResultItem } from "@/components/SearchResult/SearchResultItem"
import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import { mountSmartSearch } from "./helpers"

const { autoUpdateMock } = vi.hoisted(() => ({
  autoUpdateMock: vi.fn(() => vi.fn()),
}))

vi.mock("@floating-ui/dom", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@floating-ui/dom")>()
  return {
    ...mod,
    autoUpdate: autoUpdateMock,
  }
})

function flushAnnounce(): void {
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: FrameRequestCallback) => {
      cb(0)
      return 0
    }),
  )
}

function realRaf(): void {
  vi.unstubAllGlobals()
}

function navigableItems(ss: SmartSearch): HTMLElement[] {
  return Array.from(
    ss.menuInstance.querySelectorAll<HTMLElement>(
      `${SearchResultList.tagName} ${SearchResultItem.tagName}:not([disabled])`,
    ),
  )
}

describe("SmartSearch", () => {
  beforeEach(() => {
    flushAnnounce()
  })

  afterEach(() => {
    realRaf()
    vi.useRealTimers()
    document.body.replaceChildren()
    vi.restoreAllMocks()
    autoUpdateMock.mockReset()
    autoUpdateMock.mockImplementation(() => vi.fn())
  })

  function shadowRoot(el: SmartSearch): ShadowRoot {
    const root = el.shadowRoot
    expect(root).toBeTruthy()
    return root as ShadowRoot
  }

  describe("rendering", () => {
    test("renders inside an open shadow root", () => {
      const ss = mountSmartSearch()
      expect(ss.shadowRoot?.mode).toBe("open")
      expect(shadowRoot(ss).querySelector(`.${SmartSearch.className}`)).toBeTruthy()
    })

    test("contains an Input sub-component", () => {
      const ss = mountSmartSearch()
      expect(shadowRoot(ss).querySelector(Input.tagName!)).toBeTruthy()
    })

    test("contains a Menu sub-component", () => {
      const ss = mountSmartSearch()
      expect(shadowRoot(ss).querySelector(Menu.tagName!)).toBeTruthy()
    })

    test("contains a SearchResultList sub-component", () => {
      const ss = mountSmartSearch()
      expect(shadowRoot(ss).querySelector(SearchResultList.tagName!)).toBeTruthy()
    })

    test("has aria-label='Smart Search'", () => {
      const ss = mountSmartSearch()
      expect(ss.getAttribute("aria-label")).toBe("Smart Search")
    })

    test("has a visually-hidden live region for screen reader announcements", () => {
      const ss = mountSmartSearch()
      const live = shadowRoot(ss).querySelector<HTMLElement>('[aria-live="polite"][aria-atomic="true"]')
      expect(live).toBeTruthy()
      expect(live?.textContent).toBe("")
    })
  })

  describe("getAttrs()", () => {
    test("returns all default attribute values when no attributes are set", () => {
      const ss = mountSmartSearch()
      expect(ss.getAttrs()).toEqual(DefaultSmartSearchAttrs)
    })

    test("parses boolean attributes correctly", () => {
      const ss = mountSmartSearch({ clearable: "true" })
      expect(ss.getAttrs().clearable).toBe(false)
      const ss2 = mountSmartSearch({ clearable: "" })
      expect(ss2.getAttrs().clearable).toBe(true)
    })

    test("parses integer attributes correctly (debounce, menuMaxHeight, etc.)", () => {
      const ss = mountSmartSearch({ debounce: "0", menuMaxHeight: "240", menuOffset: "8" })
      expect(ss.getAttrs().debounce).toBe(0)
      expect(ss.getAttrs().menuMaxHeight).toBe(240)
      expect(ss.getAttrs().menuOffset).toBe(8)
    })

    test("parses JSON object attributes (options, filters)", () => {
      const options: SearchResult[] = [{ label: "One", value: "1" }]
      const filters = [{ label: "Cat", value: "c", field: "category" }]
      const ss = mountSmartSearch({
        options: JSON.stringify(options),
        filters: JSON.stringify(filters),
      })
      expect(ss.getAttrs().options).toEqual(options)
      expect(ss.getAttrs().filters).toEqual(filters)
    })
  })

  describe("getInputEl()", () => {
    test("returns the native HTMLInputElement inside the Input sub-component", () => {
      const ss = mountSmartSearch()
      const input = ss.getInputEl()
      expect(input.tagName).toBe("INPUT")
      expect(input.closest(Input.tagName!)).toBe(shadowRoot(ss).querySelector(Input.tagName!))
    })
  })

  describe("setLoading()", () => {
    test("setLoading(true) shows the menu loading indicator", () => {
      const ss = mountSmartSearch()
      ss.setLoading(true)
      expect(ss.menuInstance.loading).toBe(true)
    })

    test("setLoading(false) hides the menu loading indicator", () => {
      const ss = mountSmartSearch()
      ss.setLoading(true)
      ss.setLoading(false)
      expect(ss.menuInstance.loading).toBe(false)
    })
  })

  describe("loadResults()", () => {
    const results: SearchResult[] = [
      { label: "Apple", value: "apple" },
      { label: "Apricot", value: "apricot" },
    ]

    test("updates the result list with provided results", () => {
      const ss = mountSmartSearch()
      ss.loadResults(results, "ap")
      const items = ss.menuInstance.querySelectorAll(SearchResultItem.tagName!)
      expect(items.length).toBe(2)
    })

    test("sets menu.empty=true when result count is 0", () => {
      const ss = mountSmartSearch()
      ss.loadResults([], "")
      expect(ss.menuInstance.empty).toBe(true)
    })

    test("sets menu.empty=false when results are present", () => {
      const ss = mountSmartSearch()
      ss.loadResults(results, "ap")
      expect(ss.menuInstance.empty).toBe(false)
    })

    test("sets menu.loading=false after load", () => {
      const ss = mountSmartSearch()
      ss.setLoading(true)
      ss.loadResults(results, "ap")
      expect(ss.menuInstance.loading).toBe(false)
    })

    test("opens the menu when openMenuOnLoadResults=true (default) and count > 0", () => {
      const ss = mountSmartSearch()
      ss.loadResults(results, "ap")
      expect(ss.menuInstance.isOpen).toBe(true)
    })

    test("does not open menu when count is 0", () => {
      const ss = mountSmartSearch()
      ss.loadResults([], "")
      expect(ss.menuInstance.isOpen).toBe(false)
    })

    test("announces result count to screen readers via live region", () => {
      const ss = mountSmartSearch()
      const live = shadowRoot(ss).querySelector("[aria-live=polite][aria-atomic=true]")
      ss.loadResults(results, "ap")
      expect(live?.textContent).toBe("2 results available")
    })

    test("announces 'No results found' when count is 0", () => {
      const ss = mountSmartSearch()
      const live = shadowRoot(ss).querySelector("[aria-live=polite][aria-atomic=true]")
      ss.loadResults([], "")
      expect(live?.textContent).toBe("No results found")
    })

    test("handles grouped results (counts items across groups)", () => {
      const ss = mountSmartSearch()
      const grouped = [
        { label: "Fruit", options: [{ label: "Apple", value: "a" }] },
        {
          label: "Veg",
          options: [
            { label: "Carrot", value: "c" },
            { label: "Celery", value: "e" },
          ],
        },
      ]
      const live = shadowRoot(ss).querySelector("[aria-live=polite][aria-atomic=true]")
      ss.loadResults(grouped, "c")
      expect(live?.textContent).toBe("3 results available")
    })
  })

  describe("resultItemRenderer", () => {
    test("getter returns null by default", () => {
      const ss = mountSmartSearch()
      expect(ss.resultItemRenderer).toBeNull()
    })

    test("setter propagates renderer to the SearchResultList", () => {
      const ss = mountSmartSearch()
      const list = ss.menuInstance.querySelector<SearchResultList>(SearchResultList.tagName!)!
      const fn = () => document.createElement("span")
      ss.resultItemRenderer = fn
      expect(list.resultItemRenderer).toBe(fn)
    })
  })

  describe("attributeChangedCallback", () => {
    test("changing placeholder attribute updates the Input sub-component", () => {
      const ss = mountSmartSearch()
      ss.setAttribute("placeholder", "Find…")
      expect(ss.getInputEl().placeholder).toBe("Find…")
    })

    test("changing options attribute updates internal options", () => {
      const ss = mountSmartSearch()
      const next: SearchResult[] = [{ label: "Zed", value: "z" }]
      ss.setAttribute("options", JSON.stringify(next))
      expect(ss.options).toEqual(next)
    })

    test("changing datasource attribute clears the result cache", () => {
      const ss = mountSmartSearch()
      const spy = vi.spyOn(ss, "clearCache")
      ss.setAttribute("datasource", "https://example.com/api")
      expect(spy).toHaveBeenCalled()
    })

    test("changing filters attribute updates the FilterOptions sub-component", () => {
      const ss = mountSmartSearch({
        filters: JSON.stringify([{ label: "A", value: "a", field: "f" }]),
      })
      const filters = ss.menuInstance.querySelector(FilterOptions.tagName!)
      expect(filters).toBeTruthy()
      const next = [{ label: "B", value: "b", field: "f" }]
      ss.setAttribute("filters", JSON.stringify(next))
      expect(filters?.querySelectorAll(FilterOption.tagName!).length).toBe(1)
    })
  })

  describe("filters attribute", () => {
    test("FilterOptions is rendered inside the menu when filters attribute is set", () => {
      const ss = mountSmartSearch({
        filters: JSON.stringify([{ label: "Sports", value: "sports", field: "category" }]),
      })
      const fo = ss.menuInstance.querySelector(FilterOptions.tagName!)
      expect(fo).toBeTruthy()
      expect(ss.menuInstance.contains(fo)).toBe(true)
    })

    test("FilterOptions is not rendered when filters attribute is empty", () => {
      const ss = mountSmartSearch()
      expect(ss.menuInstance.querySelector(FilterOptions.tagName!)).toBeNull()
    })
  })

  describe("keyboard navigation", () => {
    const three: SearchResult[] = [
      { label: "A", value: "a" },
      { label: "B", value: "b" },
      { label: "C", value: "c" },
    ]

    test("ArrowDown moves focus to the first result item", () => {
      const ss = mountSmartSearch()
      ss.loadResults(three, "")
      const input = ss.getInputEl()
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      expect(ss.activeIndex).toBe(0)
    })

    test("ArrowDown advances through items without wrapping past the last", () => {
      const ss = mountSmartSearch()
      ss.loadResults(three, "")
      const input = ss.getInputEl()
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      expect(ss.activeIndex).toBe(2)
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      expect(ss.activeIndex).toBe(2)
    })

    test("ArrowUp from first item wraps to last item", () => {
      const ss = mountSmartSearch()
      ss.loadResults(three, "")
      const input = ss.getInputEl()
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      expect(ss.activeIndex).toBe(0)
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }))
      expect(ss.activeIndex).toBe(2)
    })

    test("Home key moves to the first item", () => {
      const ss = mountSmartSearch()
      ss.loadResults(three, "")
      const input = ss.getInputEl()
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }))
      expect(ss.activeIndex).toBe(0)
    })

    test("End key moves to the last item", () => {
      const ss = mountSmartSearch()
      ss.loadResults(three, "")
      const input = ss.getInputEl()
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }))
      expect(ss.activeIndex).toBe(2)
    })

    test("Enter key clicks the currently active item", () => {
      const ss = mountSmartSearch()
      const handler = vi.fn()
      ss.addEventListener(SmartSearchEventNames.MENU_SELECT, handler)
      ss.loadResults(three, "")
      const input = ss.getInputEl()
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
      expect(handler).toHaveBeenCalledTimes(1)
      const detail = handler.mock.calls[0][0] as CustomEvent
      expect(detail.detail.value).toBe("a")
    })

    test("Escape key closes the menu", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch()
      ss.loadResults(three, "")
      expect(ss.menuInstance.isOpen).toBe(true)
      ss.getInputEl().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
      vi.advanceTimersByTime(200)
      expect(ss.menuInstance.isOpen).toBe(false)
    })

    test("Tab key closes the menu", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch()
      ss.loadResults(three, "")
      ss.getInputEl().dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }))
      vi.advanceTimersByTime(200)
      expect(ss.menuInstance.isOpen).toBe(false)
    })

    test("keyboard navigation is a no-op when menu is closed", () => {
      const ss = mountSmartSearch()
      ss.getInputEl().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      expect(ss.activeIndex).toBe(-1)
    })

    test("disabled items are skipped during keyboard navigation", () => {
      const ss = mountSmartSearch()
      const withDisabled: SearchResult[] = [
        { label: "A", value: "a" },
        { label: "B", value: "b", disabled: true },
        { label: "C", value: "c" },
      ]
      ss.loadResults(withDisabled, "")
      const input = ss.getInputEl()
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      expect(ss.activeIndex).toBe(0)
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      expect(ss.activeIndex).toBe(1)
      const items = navigableItems(ss)
      expect(items.length).toBe(2)
    })

    test("active item is reflected in aria-activedescendant on the input", () => {
      const ss = mountSmartSearch()
      ss.loadResults(three, "")
      const input = ss.getInputEl()
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      const items = navigableItems(ss)
      expect(input.getAttribute("aria-activedescendant")).toBe(items[0]?.id)
    })

    test("resetActiveIndex() clears aria-activedescendant", () => {
      const ss = mountSmartSearch()
      ss.loadResults(three, "")
      const input = ss.getInputEl()
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      ss.resetActiveIndex()
      expect(input.getAttribute("aria-activedescendant")).toBe("")
    })
  })

  describe("menu open/close behaviour", () => {
    test("menu opens on input focus when openMenuOnFocus=true (default)", () => {
      const ss = mountSmartSearch({ minChars: "0" })
      ss.getInputEl().value = "q"
      ss.getInputEl().dispatchEvent(new FocusEvent("focus", { bubbles: true }))
      expect(ss.menuInstance.isOpen).toBe(true)
    })

    test("menu does not open on focus when there are no options", () => {
      const ss = mountSmartSearch({ minChars: "0", openMenuOnFocus: "" })
      ss.getInputEl().focus()
      ss.getInputEl().dispatchEvent(new FocusEvent("focus", { bubbles: true }))
      expect(ss.menuInstance.isOpen).toBe(false)
    })

    test("menu opens on input when openMenuOnInput=true (default)", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch({ debounce: "0", minChars: "0" })
      ss.getInputEl().value = "x"
      ss.getInputEl().dispatchEvent(new Event("input", { bubbles: true }))
      vi.advanceTimersByTime(0)
      expect(ss.menuInstance.isOpen).toBe(true)
    })

    test("menu closes on blur when closeMenuOnBlur=true", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch({ closeMenuOnBlur: "", minChars: "0", debounce: "0" })
      ss.loadResults([{ label: "X", value: "x" }], "x")
      expect(ss.menuInstance.isOpen).toBe(true)
      ss.getInputEl().dispatchEvent(new FocusEvent("blur", { bubbles: true }))
      vi.spyOn(document, "activeElement", "get").mockReturnValue(document.body)
      vi.runAllTimers()
      expect(ss.menuInstance.isOpen).toBe(false)
    })

    test("menu closes on item select when closeMenuOnSelect=true (default)", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch({ debounce: "0", minChars: "0" })
      ss.loadResults([{ label: "Pick", value: "p" }], "p")
      const item = ss.menuInstance.querySelector(SearchResultItem.tagName!) as SearchResultItem
      item.click()
      vi.advanceTimersByTime(200)
      expect(ss.menuInstance.isOpen).toBe(false)
    })
  })

  describe("events dispatched", () => {
    test("ss-input-change fires on input", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch({ debounce: "0", minChars: "0" })
      const handler = vi.fn()
      ss.addEventListener(SmartSearchEventNames.INPUT_CHANGE, handler)
      ss.getInputEl().value = "hi"
      ss.getInputEl().dispatchEvent(new Event("input", { bubbles: true }))
      vi.advanceTimersByTime(0)
      expect(handler).toHaveBeenCalled()
    })

    test("ss-input-focus fires on input focus", () => {
      const ss = mountSmartSearch({ minChars: "0" })
      const handler = vi.fn()
      ss.addEventListener(SmartSearchEventNames.INPUT_FOCUS, handler)
      ss.getInputEl().dispatchEvent(new FocusEvent("focus", { bubbles: true }))
      expect(handler).toHaveBeenCalled()
    })

    test("ss-input-blur fires on input blur", () => {
      const ss = mountSmartSearch()
      const handler = vi.fn()
      ss.addEventListener(SmartSearchEventNames.INPUT_BLUR, handler)
      ss.getInputEl().dispatchEvent(new FocusEvent("blur", { bubbles: true }))
      expect(handler).toHaveBeenCalled()
    })

    test("ss-menu-open listener opens the menu (command event)", () => {
      const ss = mountSmartSearch()
      ss.dispatchEvent(new CustomEvent(SmartSearchEventNames.MENU_OPEN, { bubbles: false, composed: false }))
      expect(ss.menuInstance.isOpen).toBe(true)
      expect(ss.getInputEl().getAttribute("aria-expanded")).toBe("true")
    })

    test("ss-menu-close listener hides the menu", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch()
      ss.loadResults([{ label: "X", value: "x" }], "x")
      ss.dispatchEvent(new CustomEvent(SmartSearchEventNames.MENU_CLOSE, { bubbles: false, composed: false }))
      vi.advanceTimersByTime(200)
      expect(ss.menuInstance.isOpen).toBe(false)
    })

    test("ss-menu-select fires on item select with value and result", () => {
      const ss = mountSmartSearch()
      const handler = vi.fn()
      ss.addEventListener(SmartSearchEventNames.MENU_SELECT, handler)
      const result: SearchResult = { label: "Z", value: "z" }
      ss.loadResults([result], "z")
      const item = ss.menuInstance.querySelector(SearchResultItem.tagName!) as HTMLElement
      item.click()
      expect(handler).toHaveBeenCalledTimes(1)
      const ev = handler.mock.calls[0][0] as CustomEvent
      expect(ev.detail.value).toBe("z")
      expect(ev.detail.result).toEqual(result)
    })

    test("ss-filter-change fires when a filter option is toggled", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch({
        filters: JSON.stringify([{ label: "A", value: "a", field: "f" }]),
        debounce: "0",
        minChars: "0",
      })
      const handler = vi.fn()
      ss.addEventListener(SmartSearchEventNames.FILTER_CHANGE, handler)
      const opt = ss.menuInstance.querySelector(FilterOption.tagName!) as HTMLElement
      opt.click()
      vi.advanceTimersByTime(0)
      expect(handler).toHaveBeenCalled()
    })

    test("ss-load-error fires when datasource fetch fails", async () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch({ datasource: "https://example.test/search", minChars: "0", debounce: "0" })
      const handler = vi.fn()
      ss.addEventListener(SmartSearchEventNames.LOAD_ERROR, handler)
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")))
      ss.getInputEl().value = "q"
      ss.getInputEl().dispatchEvent(new Event("input", { bubbles: true }))
      vi.advanceTimersByTime(0)
      await vi.waitFor(() => expect(handler).toHaveBeenCalled())
      vi.unstubAllGlobals()
    })
  })

  describe("data loading", () => {
    test("loadData() is called on input when fetchDataOn='input' (default)", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch({ debounce: "0", minChars: "0" })
      const spy = vi.spyOn(ss, "loadData")
      ss.getInputEl().value = "a"
      ss.getInputEl().dispatchEvent(new Event("input", { bubbles: true }))
      vi.advanceTimersByTime(0)
      expect(spy).toHaveBeenCalled()
    })

    test("loadData() is called on focus when fetchDataOn='focus'", () => {
      const ss = mountSmartSearch({ fetchDataOn: "focus", minChars: "0" })
      const spy = vi.spyOn(ss, "loadData")
      ss.getInputEl().dispatchEvent(new FocusEvent("focus", { bubbles: true }))
      expect(spy).toHaveBeenCalled()
    })

    test("loadData() is not called on input when fetchDataOn='focus'", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch({ fetchDataOn: "focus", debounce: "0", minChars: "0" })
      const spy = vi.spyOn(ss, "loadData")
      spy.mockClear()
      ss.getInputEl().value = "a"
      ss.getInputEl().dispatchEvent(new Event("input", { bubbles: true }))
      vi.advanceTimersByTime(0)
      expect(spy).not.toHaveBeenCalled()
    })

    test("loadData() fetches from datasource URL when set", async () => {
      vi.useFakeTimers()
      const json = [{ label: "Api", value: "api" }]
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => json,
        }),
      )
      const ss = mountSmartSearch({
        datasource: "https://example.test/api?",
        minChars: "0",
        debounce: "0",
      })
      ss.getInputEl().value = "x"
      ss.getInputEl().dispatchEvent(new Event("input", { bubbles: true }))
      vi.advanceTimersByTime(0)
      await vi.waitFor(() => expect(fetch).toHaveBeenCalled())
      expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain("q=x")
      vi.unstubAllGlobals()
    })

    test("loadData() uses dataAdapter when set", async () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch({ minChars: "0", debounce: "0" })
      const results: SearchResult[] = [{ label: "Adapted", value: "ad" }]
      ss.dataAdapter = async () => results
      const spy = vi.spyOn(ss, "loadResults")
      ss.getInputEl().value = "q"
      ss.getInputEl().dispatchEvent(new Event("input", { bubbles: true }))
      vi.advanceTimersByTime(0)
      await vi.waitFor(() => expect(spy).toHaveBeenCalledWith(results, "q"))
    })

    test("loadData() filters static options when no datasource or adapter", async () => {
      vi.useFakeTimers()
      const opts: SearchResult[] = [
        { label: "Alpha", value: "a" },
        { label: "Beta", value: "b" },
      ]
      const ss = mountSmartSearch({
        options: JSON.stringify(opts),
        minChars: "0",
        debounce: "0",
      })
      ss.getInputEl().value = "al"
      ss.getInputEl().dispatchEvent(new Event("input", { bubbles: true }))
      vi.advanceTimersByTime(0)
      await vi.waitFor(() => expect(ss.menuInstance.querySelectorAll(SearchResultItem.tagName!).length).toBe(1))
    })

    test("results are cached — same query does not trigger a second fetch", async () => {
      vi.useFakeTimers()
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ label: "One", value: "1" }],
      })
      vi.stubGlobal("fetch", fetchMock)
      const ss = mountSmartSearch({
        datasource: "https://example.test?",
        minChars: "0",
        debounce: "0",
      })
      const input = ss.getInputEl()
      input.value = "same"
      input.dispatchEvent(new Event("input", { bubbles: true }))
      vi.advanceTimersByTime(0)
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
      await vi.waitFor(() => expect(ss.menuInstance.querySelectorAll(SearchResultItem.tagName!).length).toBe(1))
      input.dispatchEvent(new Event("input", { bubbles: true }))
      vi.advanceTimersByTime(0)
      await Promise.resolve()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      vi.unstubAllGlobals()
    })
  })

  describe("getActiveFilters()", () => {
    test("returns empty array when no filters are active", () => {
      const ss = mountSmartSearch({
        filters: JSON.stringify([{ label: "A", value: "a", field: "f" }]),
      })
      expect(ss.getActiveFilters()).toEqual([])
    })

    test("returns field/value pairs for selected filters", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch({
        filters: JSON.stringify([
          { label: "A", value: "a", field: "f" },
          { label: "B", value: "b", field: "f" },
        ]),
        debounce: "0",
        minChars: "0",
      })
      ;(ss.menuInstance.querySelector(FilterOption.tagName!) as HTMLElement).click()
      vi.advanceTimersByTime(0)
      expect(ss.getActiveFilters()).toEqual([{ field: "f", value: "a" }])
    })
  })

  describe("DisabledMixin", () => {
    test("disabled attribute propagates aria-disabled", () => {
      const ss = mountSmartSearch()
      ss.setAttribute("disabled", "")
      expect(ss.getAttribute("aria-disabled")).toBe("true")
    })

    test("handleInput is a no-op when component is disabled", () => {
      vi.useFakeTimers()
      const ss = mountSmartSearch({ disabled: "", debounce: "0", minChars: "0" })
      const spy = vi.spyOn(ss, "loadData")
      ss.getInputEl().value = "x"
      ss.getInputEl().dispatchEvent(new Event("input", { bubbles: true }))
      vi.advanceTimersByTime(0)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe("disconnect / cleanup", () => {
    test("search result list is removed on disconnect", () => {
      const ss = mountSmartSearch()
      const list = ss.menuInstance.querySelector(SearchResultList.tagName!)!
      expect(list.parentElement).toBe(ss.menuInstance)
      ss.remove()
      expect(list.parentElement).toBeNull()
    })

    test("live region is removed on disconnect", () => {
      const ss = mountSmartSearch()
      const live = shadowRoot(ss).querySelector("[aria-live=polite][aria-atomic=true]")!
      ss.remove()
      expect(live.parentElement).toBeNull()
    })

    test("event listeners are cleaned up via AbortController on disconnect", () => {
      const addSpy = vi.spyOn(AbortSignal.prototype, "addEventListener")
      const ss = mountSmartSearch()
      expect(addSpy).toHaveBeenCalled()
      const abortSpy = vi.spyOn((ss as unknown as { abort: AbortController }).abort, "abort")
      ss.remove()
      expect(abortSpy).toHaveBeenCalled()
    })
  })
})
