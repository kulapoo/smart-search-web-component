import { describe, test, expect, vi, afterEach } from "vitest"
import { mountSearchResultItem, defaultResult } from "../helpers"

describe("SearchResultItem", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  describe("rendering & ARIA", () => {
    test("has role=option", () => {
      const el = mountSearchResultItem()
      expect(el.getAttribute("role")).toBe("option")
    })

    test("has tabindex=-1", () => {
      const el = mountSearchResultItem()
      expect(el.getAttribute("tabindex")).toBe("-1")
    })

    test("gets an auto-assigned id if not given one", () => {
      const el = mountSearchResultItem()
      expect(el.id).toMatch(/^ss-result-item-\d+$/)
    })
  })

  describe("value getter", () => {
    test("value getter returns the result's value", () => {
      const el = mountSearchResultItem({
        result: { label: "Banana", value: "banana" },
      })
      expect(el.value).toBe("banana")
    })
  })

  describe("click interaction", () => {
    test("click triggers onSelect with value, result, and event", () => {
      const onSelect = vi.fn()
      const el = mountSearchResultItem({ onSelect })
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenCalledWith(defaultResult.value, defaultResult, expect.any(MouseEvent))
    })

    test("click on a disabled item does not trigger onSelect", () => {
      const onSelect = vi.fn()
      const el = mountSearchResultItem({
        result: { ...defaultResult, disabled: true },
        onSelect,
      })
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe("selected option", () => {
    test("passing selected=true sets the selected attribute", () => {
      const el = mountSearchResultItem({ selected: true })
      expect(el.selected).toBe(true)
      expect(el.hasAttribute("selected")).toBe(true)
    })
  })

  describe("disabled from result", () => {
    test("result.disabled=true sets the disabled attribute on the element", () => {
      const el = mountSearchResultItem({
        result: { ...defaultResult, disabled: true },
      })
      expect(el.disabled).toBe(true)
      expect(el.hasAttribute("disabled")).toBe(true)
    })
  })

  describe("update()", () => {
    test("update() replaces the internal result", () => {
      const el = mountSearchResultItem()
      const next = { label: "Banana", value: "banana" }
      el.update(next)
      expect(el.value).toBe("banana")
    })

    test("update() syncs disabled state from new result", () => {
      const el = mountSearchResultItem({
        result: { ...defaultResult, disabled: false },
      })
      el.update({ ...defaultResult, disabled: true })
      expect(el.disabled).toBe(true)
    })
  })

  describe("ActiveMixin", () => {
    test("active=true sets aria-selected=true", () => {
      const el = mountSearchResultItem()
      el.active = true
      expect(el.getAttribute("aria-selected")).toBe("true")
    })

    test("active=false sets aria-selected=false", () => {
      const el = mountSearchResultItem()
      el.active = true
      el.active = false
      expect(el.getAttribute("aria-selected")).toBe("false")
    })
  })

  describe("DisabledMixin", () => {
    test("disabled=true sets aria-disabled=true", () => {
      const el = mountSearchResultItem()
      el.disabled = true
      expect(el.getAttribute("aria-disabled")).toBe("true")
    })
  })
})
