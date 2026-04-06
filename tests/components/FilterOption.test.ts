import { describe, test, expect, vi, afterEach } from "vitest"
import { mountFilterOption, defaultFilterData } from "../helpers"

describe("FilterOption", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  describe("rendering", () => {
    test("text content defaults to the label", () => {
      const el = mountFilterOption({ label: "Test" })
      expect(el.textContent).toBe("Test")
    })

    test("id is derived from value", () => {
      const el = mountFilterOption({ value: "books" })
      expect(el.id).toBe("filter-option-books")
    })

    test("has ss-filter-option class", () => {
      const el = mountFilterOption()
      expect(el.classList.contains("ss-filter-option")).toBe(true)
    })
  })

  describe("ARIA", () => {
    test("has role=option", () => {
      const el = mountFilterOption()
      expect(el.getAttribute("role")).toBe("option")
    })

    test("has tabindex=-1", () => {
      const el = mountFilterOption()
      expect(el.getAttribute("tabindex")).toBe("-1")
    })
  })

  describe("attributeChangedCallback", () => {
    test("changing label attribute updates text content", () => {
      const el = mountFilterOption({ label: "A" })
      el.setAttribute("label", "B")
      expect(el.textContent).toBe("B")
    })

    test("changing value attribute updates the element id", () => {
      const el = mountFilterOption({ value: "x" })
      el.setAttribute("value", "y")
      expect(el.id).toBe("filter-option-y")
    })
  })

  describe("click interaction", () => {
    test("click triggers onChange callback", () => {
      const onChange = vi.fn()
      const el = mountFilterOption({ onChange })
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(expect.any(MouseEvent))
    })
  })

  describe("metadata getter", () => {
    test("returns undefined when metadata was not provided", () => {
      const el = mountFilterOption()
      expect(el.metadata).toBeUndefined()
    })

    test("returns the metadata object that was passed in constructor", () => {
      const metadata = { tier: "pro" }
      const el = mountFilterOption({ metadata })
      expect(el.metadata).toBe(metadata)
    })
  })

  describe("ActiveMixin", () => {
    test("active=true sets aria-selected=true", () => {
      const el = mountFilterOption()
      el.active = true
      expect(el.getAttribute("aria-selected")).toBe("true")
    })

    test("active=false sets aria-selected=false", () => {
      const el = mountFilterOption()
      el.active = true
      el.active = false
      expect(el.getAttribute("aria-selected")).toBe("false")
    })
  })

  describe("custom renderFn", () => {
    test("renderFn is used instead of textContent when provided", () => {
      const el = mountFilterOption({
        label: "Hidden",
        renderFn: () => "Rendered",
      })
      expect(el.textContent).toBe("Rendered")
    })

    test("setting renderFn after mount re-renders the content", () => {
      const el = mountFilterOption({ label: "Plain" })
      expect(el.textContent).toBe("Plain")
      el.renderFn = () => `Custom ${defaultFilterData.label}`
      expect(el.textContent).toBe(`Custom ${defaultFilterData.label}`)
    })
  })
})
