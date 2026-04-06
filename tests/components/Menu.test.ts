import { describe, test, expect, vi, afterEach } from "vitest"

import { Menu } from "@/components/Menu/Menu"
import { mountMenu } from "../helpers"

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

describe("Menu", () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.replaceChildren()
    autoUpdateMock.mockReset()
    autoUpdateMock.mockImplementation(() => vi.fn())
  })

  describe("ARIA", () => {
    test("has role=listbox", () => {
      const { el } = mountMenu()
      expect(el.getAttribute("role")).toBe("listbox")
    })

    test("has aria-label='Search results'", () => {
      const { el } = mountMenu()
      expect(el.getAttribute("aria-label")).toBe("Search results")
    })

    test("id defaults to Menu.listboxId", () => {
      const { el } = mountMenu()
      expect(el.id).toBe(Menu.listboxId)
    })

    test("respects options.id when provided", () => {
      const anchor = document.createElement("div")
      document.body.appendChild(anchor)
      const el = new Menu({ anchor, onClose: vi.fn(), id: "custom-listbox" })
      document.body.appendChild(el)
      expect(el.id).toBe("custom-listbox")
    })
  })

  describe("show() / hide() / isOpen", () => {
    test("menu starts without the open attribute", () => {
      const { el } = mountMenu()
      expect(el.hasAttribute("open")).toBe(false)
    })

    test("show() adds the open attribute", () => {
      const { el } = mountMenu()
      el.show()
      expect(el.hasAttribute("open")).toBe(true)
    })

    test("show() is a no-op when already open", () => {
      const { el } = mountMenu()
      el.show()
      expect(autoUpdateMock).toHaveBeenCalledTimes(1)
      el.show()
      expect(autoUpdateMock).toHaveBeenCalledTimes(1)
    })

    test("hide() removes the open attribute (after animation/timeout)", () => {
      vi.useFakeTimers()
      const { el } = mountMenu()
      el.show()
      el.hide()
      expect(el.hasAttribute("open")).toBe(true)
      vi.advanceTimersByTime(200)
      expect(el.hasAttribute("open")).toBe(false)
    })

    test("hide() adds closing attribute temporarily", () => {
      vi.useFakeTimers()
      const { el } = mountMenu()
      el.show()
      el.hide()
      expect(el.hasAttribute("closing")).toBe(true)
      vi.advanceTimersByTime(200)
      expect(el.hasAttribute("closing")).toBe(false)
    })

    test("hide() is a no-op when already closed", () => {
      const { el } = mountMenu()
      el.hide()
      expect(el.hasAttribute("open")).toBe(false)
      expect(el.hasAttribute("closing")).toBe(false)
    })

    test("isOpen returns true when open attribute is present", () => {
      const { el } = mountMenu()
      el.show()
      expect(el.isOpen).toBe(true)
    })

    test("isOpen returns false when open attribute is absent", () => {
      const { el } = mountMenu()
      expect(el.isOpen).toBe(false)
    })
  })

  describe("loading", () => {
    test("loading getter returns false by default", () => {
      const { el } = mountMenu()
      expect(el.loading).toBe(false)
    })

    test("setting loading=true shows the loading element", () => {
      const { el } = mountMenu()
      const loadingEl = el.querySelector(".ss-menu-loading") as HTMLElement
      expect(loadingEl.hidden).toBe(true)
      el.loading = true
      expect(loadingEl.hidden).toBe(false)
      expect(el.loading).toBe(true)
    })

    test("setting loading=false hides the loading element", () => {
      const { el } = mountMenu()
      el.loading = true
      el.loading = false
      expect((el.querySelector(".ss-menu-loading") as HTMLElement).hidden).toBe(true)
      expect(el.loading).toBe(false)
    })
  })

  describe("empty", () => {
    test("empty getter returns false by default", () => {
      const { el } = mountMenu()
      expect(el.empty).toBe(false)
    })

    test("setting empty=true shows the empty element", () => {
      const { el } = mountMenu()
      const emptyEl = el.querySelector(".ss-menu-empty") as HTMLElement
      expect(emptyEl.hidden).toBe(true)
      el.empty = true
      expect(emptyEl.hidden).toBe(false)
      expect(el.empty).toBe(true)
    })

    test("setting empty=false hides the empty element", () => {
      const { el } = mountMenu()
      el.empty = true
      el.empty = false
      expect((el.querySelector(".ss-menu-empty") as HTMLElement).hidden).toBe(true)
      expect(el.empty).toBe(false)
    })
  })

  describe("handleKeydown()", () => {
    test("calls onClose on Escape key by default", () => {
      const onClose = vi.fn()
      const { el } = mountMenu({ onClose })
      const ev = new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      const preventDefaultSpy = vi.spyOn(ev, "preventDefault")
      el.handleKeydown(ev)
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    test("does not call onClose on Escape when closeOnEscape=false", () => {
      const onClose = vi.fn()
      const { el } = mountMenu({ onClose, closeOnEscape: false })
      const ev = new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      const preventDefaultSpy = vi.spyOn(ev, "preventDefault")
      el.handleKeydown(ev)
      expect(preventDefaultSpy).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
    })

    test("ignores keys other than Escape", () => {
      const onClose = vi.fn()
      const { el } = mountMenu({ onClose })
      el.handleKeydown(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe("click outside", () => {
    test("calls onClose when clicking outside anchor and menu", () => {
      const onClose = vi.fn()
      const { el } = mountMenu({ onClose })
      el.show()
      onClose.mockClear()

      const outside = document.createElement("div")
      document.body.appendChild(outside)
      outside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    test("does not call onClose when clicking inside menu", () => {
      const onClose = vi.fn()
      const { el } = mountMenu({ onClose })
      el.show()
      onClose.mockClear()

      el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }))

      expect(onClose).not.toHaveBeenCalled()
    })

    test("does not call onClose when clicking anchor", () => {
      const onClose = vi.fn()
      const { el, anchor } = mountMenu({ onClose })
      el.show()
      onClose.mockClear()

      anchor.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }))

      expect(onClose).not.toHaveBeenCalled()
    })

    test("click-outside handler is not attached when closeOnClickOutside=false", () => {
      const addSpy = vi.spyOn(document, "addEventListener")
      try {
        const { el } = mountMenu({ closeOnClickOutside: false })
        el.show()

        const pointerAdds = addSpy.mock.calls.filter(([type]) => type === "pointerdown")
        expect(pointerAdds.length).toBe(0)
      } finally {
        addSpy.mockRestore()
      }
    })
  })

  describe("cleanup on disconnect", () => {
    test("positioning cleanup runs on disconnectedCallback", () => {
      const cleanup = vi.fn()
      autoUpdateMock.mockImplementation(() => cleanup)
      const { el } = mountMenu()
      el.show()
      el.remove()
      expect(cleanup).toHaveBeenCalledTimes(1)
    })

    test("click-outside listener is removed on disconnectedCallback", () => {
      const onClose = vi.fn()
      const { el } = mountMenu({ onClose })
      el.show()
      onClose.mockClear()
      el.remove()

      const outside = document.createElement("div")
      document.body.appendChild(outside)
      outside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }))

      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
