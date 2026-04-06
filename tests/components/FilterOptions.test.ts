import { describe, test, expect, vi } from "vitest"
import { mountFilterOptions } from "../helpers"
import { FilterOption } from "@/components/Filter/FilterOption"
import { FilterOptions } from "@/components/Filter/FilterOptions"

describe("FilterOptions", () => {
  describe("rendering", () => {
    test("has ss-filter-options class", () => {
      const el = mountFilterOptions()
      expect(el.classList.contains(FilterOptions.className)).toBe(true)
    })

    test("renders a FilterOption child for each option", () => {
      const el = mountFilterOptions({
        options: [
          { label: "A", value: "a", field: "f" },
          { label: "B", value: "b", field: "f" },
          { label: "C", value: "c", field: "f" },
        ],
      })
      const children = el.querySelectorAll(FilterOption.tagName)
      expect(children.length).toBe(3)
      expect(children[0]).toBeInstanceOf(FilterOption)
    })
  })

  describe("ARIA", () => {
    test("has role=group", () => {
      const el = mountFilterOptions()
      expect(el.getAttribute("role")).toBe("group")
    })

    test("has aria-label='Filters'", () => {
      const el = mountFilterOptions()
      expect(el.getAttribute("aria-label")).toBe("Filters")
    })

    test("has aria-multiselectable=true by default", () => {
      const el = mountFilterOptions()
      expect(el.getAttribute("aria-multiselectable")).toBe("true")
    })

    test("has aria-multiselectable=false when multiple=false", () => {
      const el = mountFilterOptions({ multiple: false })
      expect(el.getAttribute("aria-multiselectable")).toBe("false")
    })
  })

  describe("update()", () => {
    test("replaces all children with new options", () => {
      const el = mountFilterOptions()
      expect(el.querySelectorAll(FilterOption.tagName).length).toBe(2)

      el.update([{ label: "Only", value: "only", field: "category" }])
      expect(el.querySelectorAll(FilterOption.tagName).length).toBe(1)
      expect(el.querySelector(FilterOption.tagName)?.getAttribute("value")).toBe("only")
    })

    test("added options render as FilterOption elements", () => {
      const el = mountFilterOptions()
      el.update([
        { label: "Sports", value: "sports", field: "category" },
        { label: "Tech", value: "tech", field: "category" },
        { label: "Music", value: "music", field: "category" },
      ])
      const children = Array.from(el.querySelectorAll(FilterOption.tagName))
      expect(children.every((c) => c instanceof FilterOption)).toBe(true)
      expect(children.map((c) => c.getAttribute("value"))).toEqual(["sports", "tech", "music"])
    })

    test("removed options are no longer in the DOM", () => {
      const el = mountFilterOptions()
      el.update([{ label: "Tech", value: "tech", field: "category" }])
      expect(el.querySelectorAll(FilterOption.tagName).length).toBe(1)
      expect(el.querySelector(`[value="sports"]`)).toBeNull()
    })

    test("previously selected values remain active after update()", () => {
      const el = mountFilterOptions()
      const [sports] = Array.from(el.querySelectorAll<FilterOption>(FilterOption.tagName))
      sports.click()
      expect(sports.active).toBe(true)

      el.update([
        { label: "Sports (renamed)", value: "sports", field: "category" },
        { label: "Tech", value: "tech", field: "category" },
      ])
      const after = el.querySelector<FilterOption>(`[value="sports"]`)
      expect(after?.active).toBe(true)
      expect(after?.textContent).toBe("Sports (renamed)")
    })
  })

  describe("onChange callback", () => {
    test("clicking a FilterOption triggers onChange with selected values", () => {
      const onChange = vi.fn()
      const el = mountFilterOptions({ onChange })
      const [sports] = Array.from(el.querySelectorAll<FilterOption>(FilterOption.tagName))

      sports.click()

      expect(onChange).toHaveBeenCalledTimes(1)
      const evt = onChange.mock.calls[0][0] as CustomEvent<{ selected: string[] }>
      expect(evt.detail.selected).toEqual(["sports"])
    })

    test("clicking an active option deselects it and fires onChange", () => {
      const onChange = vi.fn()
      const el = mountFilterOptions({ onChange })
      const [sports] = Array.from(el.querySelectorAll<FilterOption>(FilterOption.tagName))

      sports.click()
      sports.click()

      expect(onChange).toHaveBeenCalledTimes(2)
      const evt = onChange.mock.calls[1][0] as CustomEvent<{ selected: string[] }>
      expect(evt.detail.selected).toEqual([])
    })

    test("multiple options can be selected simultaneously", () => {
      const onChange = vi.fn()
      const el = mountFilterOptions({ onChange })
      const [sports, tech] = Array.from(el.querySelectorAll<FilterOption>(FilterOption.tagName))

      sports.click()
      tech.click()

      const evt = onChange.mock.calls[1][0] as CustomEvent<{ selected: string[] }>
      expect(evt.detail.selected).toEqual(["sports", "tech"])
    })
  })

  describe("getActiveFilters()", () => {
    test("returns empty array when nothing is selected", () => {
      const el = mountFilterOptions()
      expect(el.getActiveFilters()).toEqual([])
    })

    test("returns field and value for each selected option", () => {
      const el = mountFilterOptions()
      const [sports, tech] = Array.from(el.querySelectorAll<FilterOption>(FilterOption.tagName))
      sports.click()
      tech.click()

      expect(el.getActiveFilters()).toEqual([
        { field: "category", value: "sports" },
        { field: "category", value: "tech" },
      ])
    })
  })

  describe("renderFn", () => {
    test("setting renderFn re-renders all options with custom content", () => {
      const el = mountFilterOptions()
      el.renderFn = (data) => {
        const span = document.createElement("span")
        span.className = "custom-filter-label"
        span.textContent = `X:${data.label}`
        return span
      }

      const options = Array.from(el.querySelectorAll<FilterOption>(FilterOption.tagName))
      expect(options[0].querySelector(".custom-filter-label")?.textContent).toBe("X:Sports")
      expect(options[1].querySelector(".custom-filter-label")?.textContent).toBe("X:Tech")
    })
  })

  describe("selection mode", () => {
    function getOptions(el: ReturnType<typeof mountFilterOptions>) {
      return Array.from(el.querySelectorAll<FilterOption>(FilterOption.tagName))
    }

    describe("multiple=true (default)", () => {
      test("multiple options can be selected simultaneously", () => {
        const onChange = vi.fn()
        const el = mountFilterOptions({ onChange })
        const [sports, tech] = getOptions(el)

        sports.click()
        tech.click()

        expect(sports.active).toBe(true)
        expect(tech.active).toBe(true)
        expect(onChange).toHaveBeenCalledTimes(2)
      })

      test("clicking an active option deselects only that option", () => {
        const onChange = vi.fn()
        const el = mountFilterOptions({ onChange })
        const [sports, tech] = getOptions(el)

        sports.click()
        tech.click()
        sports.click()

        expect(sports.active).toBe(false)
        expect(tech.active).toBe(true)
        const lastCall = onChange.mock.calls[2][0] as CustomEvent
        expect(lastCall.detail.selected).toEqual(["tech"])
      })

      test("aria-multiselectable is true", () => {
        const el = mountFilterOptions()
        expect(el.getAttribute("aria-multiselectable")).toBe("true")
      })
    })

    describe("multiple=false (single select)", () => {
      test("selecting one option deselects all others", () => {
        const onChange = vi.fn()
        const el = mountFilterOptions({ multiple: false, onChange })
        const [sports, tech] = getOptions(el)

        sports.click()
        expect(sports.active).toBe(true)
        expect(tech.active).toBe(false)

        tech.click()
        expect(sports.active).toBe(false)
        expect(tech.active).toBe(true)
      })

      test("clicking an already-active option deselects it (none selected)", () => {
        const onChange = vi.fn()
        const el = mountFilterOptions({ multiple: false, onChange })
        const [sports] = getOptions(el)

        sports.click()
        expect(sports.active).toBe(true)

        sports.click()
        expect(sports.active).toBe(false)
        const lastCall = onChange.mock.calls[1][0] as CustomEvent
        expect(lastCall.detail.selected).toEqual([])
      })

      test("onChange fires with at most one value in selected array", () => {
        const onChange = vi.fn()
        const el = mountFilterOptions({ multiple: false, onChange })
        const [sports, tech] = getOptions(el)

        sports.click()
        tech.click()

        const lastCall = onChange.mock.calls[1][0] as CustomEvent
        expect(lastCall.detail.selected.length).toBe(1)
        expect(lastCall.detail.selected).toEqual(["tech"])
      })

      test("aria-multiselectable is false", () => {
        const el = mountFilterOptions({ multiple: false })
        expect(el.getAttribute("aria-multiselectable")).toBe("false")
      })
    })

    describe("runtime mode switching", () => {
      test("switching multiple=false with >1 selected keeps only the last selected", () => {
        const el = mountFilterOptions()
        const [sports, tech] = getOptions(el)

        sports.click()
        tech.click()
        expect(sports.active).toBe(true)
        expect(tech.active).toBe(true)

        el.multiple = false

        expect(sports.active).toBe(false)
        expect(tech.active).toBe(true)
      })

      test("switching to multiple=false updates aria-multiselectable", () => {
        const el = mountFilterOptions()
        expect(el.getAttribute("aria-multiselectable")).toBe("true")

        el.multiple = false
        expect(el.getAttribute("aria-multiselectable")).toBe("false")
      })

      test("switching back to multiple=true allows selecting multiple again", () => {
        const el = mountFilterOptions({ multiple: false })
        const [sports, tech] = getOptions(el)

        sports.click()
        expect(sports.active).toBe(true)

        el.multiple = true

        tech.click()
        expect(sports.active).toBe(true)
        expect(tech.active).toBe(true)
      })
    })
  })
})
