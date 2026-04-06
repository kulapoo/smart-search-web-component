import { describe, test, expect, vi } from "vitest"
import { mountInput } from "../helpers"

describe("Input", () => {
  describe("rendering", () => {
    test("renders a native <input> element", () => {
      const el = mountInput()
      expect(el.querySelector("input")).toBeTruthy()
    })

    test("renders a clear button element", () => {
      const el = mountInput()
      expect(el.querySelector("button")).toBeTruthy()
    })

    test("native input has role=combobox", () => {
      const el = mountInput()
      expect(el.querySelector("input")?.getAttribute("role")).toBe("combobox")
    })

    test("native input has aria-expanded=false initially", () => {
      const el = mountInput()
      expect(el.querySelector("input")?.getAttribute("aria-expanded")).toBe("false")
    })

    test("native input has aria-autocomplete=list", () => {
      const menuId = "test-menu"
      const el = mountInput({ menuId })
      expect(el.querySelector("input")?.getAttribute("aria-autocomplete")).toBe("list")
    })

    test("native input has aria-controls pointing to Menu.listboxId", () => {
      const menuId = "test-menu"
      const el = mountInput({ menuId })
      expect(el.querySelector("input")?.getAttribute("aria-controls")).toBe(menuId)
    })
  })

  describe("placeholder attribute", () => {
    test("placeholder attribute is applied to native input on render", () => {
      const el = mountInput({ placeholder: "Test" })
      expect(el.querySelector("input")?.getAttribute("placeholder")).toBe("Test")
    })

    test("attributeChangedCallback updates placeholder after render", () => {
      const el = mountInput()
      el.setAttribute("placeholder", "Test")
      expect(el.querySelector("input")?.getAttribute("placeholder")).toBe("Test")
    })
  })

  describe("clearable attribute", () => {
    test("clear button is hidden when clearable is not set", () => {
      const el = mountInput()
      expect(el.querySelector("button")?.hidden).toBe(true)
    })

    test("clear button is visible when clearable attribute is present", () => {
      const el = mountInput({ clearable: "true" })
      expect(el.querySelector("button")?.hidden).toBe(false)
    })

    test("attributeChangedCallback shows/hides clear button when clearable changes", () => {
      const el = mountInput()
      el.setAttribute("clearable", "true")
      expect(el.querySelector("button")?.hidden).toBe(false)
      el.setAttribute("clearable", "false")
      expect(el.querySelector("button")?.hidden).toBe(true)
    })
  })

  describe("callbacks", () => {
    test("onInput callback is called with value on native input event", () => {
      const onInput = vi.fn()
      const el = mountInput({}, { onInput })
      const input = el.inputElement
      input.value = "test"
      input.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
      expect(onInput).toHaveBeenCalledWith("test", expect.any(Event))
    })

    test("onBlur callback is called on native blur event", () => {
      const onBlur = vi.fn()
      const el = mountInput({}, { onBlur })
      const input = el.inputElement
      input.value = "hi"
      input.dispatchEvent(new Event("blur", { bubbles: true, composed: true }))
      expect(onBlur).toHaveBeenCalledWith("hi", expect.any(Event))
    })

    test("onFocus callback is called on native focus event", () => {
      const onFocus = vi.fn()
      const el = mountInput({}, { onFocus })
      const input = el.inputElement
      input.value = "yo"
      input.dispatchEvent(new Event("focus", { bubbles: true, composed: true }))
      expect(onFocus).toHaveBeenCalledWith("yo", expect.any(Event))
    })

    test("onClear callback is called when clear button is clicked", () => {
      const onClear = vi.fn()
      const el = mountInput({ clearable: "true" }, { onClear })
      el.querySelector("button")!.click()
      expect(onClear).toHaveBeenCalledOnce()
    })

    test("onInput is called with empty string when clear button is clicked", () => {
      const onInput = vi.fn()
      const el = mountInput({ clearable: "true" }, { onInput })
      el.inputElement.value = "x"
      el.querySelector("button")!.click()
      expect(onInput).toHaveBeenCalledWith("", null)
    })
  })

  describe("has-value class", () => {
    test("has-value class is added to host when input has text", () => {
      const el = mountInput()
      expect(el.classList.contains("has-value")).toBe(false)
      el.inputElement.value = "x"
      el.inputElement.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
      expect(el.classList.contains("has-value")).toBe(true)
    })

    test("has-value class is removed when input is cleared", () => {
      const el = mountInput({ clearable: "true" })
      el.inputElement.value = "x"
      el.inputElement.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
      expect(el.classList.contains("has-value")).toBe(true)
      el.querySelector("button")!.click()
      expect(el.classList.contains("has-value")).toBe(false)
    })
  })

  describe("debounce attribute", () => {
    test("onInput is called immediately when debounce is not set", () => {
      const onInput = vi.fn()
      const el = mountInput({}, { onInput })
      const input = el.inputElement
      input.value = "a"
      input.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
      expect(onInput).toHaveBeenCalledWith("a", expect.any(Event))
    })

    test("onInput is debounced when debounce attribute is set", () => {
      vi.useFakeTimers()
      try {
        const onInput = vi.fn()
        const el = mountInput({ debounce: "100" }, { onInput })
        const input = el.inputElement
        input.value = "a"
        input.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
        input.value = "ab"
        input.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
        expect(onInput).not.toHaveBeenCalled()
        vi.advanceTimersByTime(100)
        expect(onInput).toHaveBeenCalledTimes(1)
        expect(onInput).toHaveBeenCalledWith("ab", expect.any(Event))
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe("inputElement getter", () => {
    test("inputElement returns the native HTMLInputElement", () => {
      const el = mountInput()
      expect(el.inputElement).toBe(el.querySelector("input"))
    })
  })

  describe("DisabledMixin", () => {
    test("disabled attribute sets aria-disabled", () => {
      const el = mountInput()
      el.setAttribute("disabled", "")
      expect(el.getAttribute("aria-disabled")).toBe("true")
      el.removeAttribute("disabled")
      expect(el.getAttribute("aria-disabled")).toBe("false")
    })
  })
})
