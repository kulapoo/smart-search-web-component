import { describe, test, expect, vi } from "vitest"
import { makeTestComponent } from "../helpers"

describe("Component (base class)", () => {
  describe("rendering", () => {
    test("render() output is appended as a child when shadowMode is unset", () => {
      const { mount } = makeTestComponent({
        renderChild: () => {
          const span = document.createElement("span")
          span.textContent = "rendered"
          return span
        },
      })
      const el = mount()
      expect(el.querySelector("span")?.textContent).toBe("rendered")
      el.remove()
    })

    test("render() output is appended to a ShadowRoot when shadowMode='open'", () => {
      const { mount } = makeTestComponent({
        shadowMode: "open",
        renderChild: () => {
          const span = document.createElement("span")
          span.textContent = "rendered"
          return span
        },
      })
      const el = mount()
      expect(el.shadowRoot?.querySelector("span")?.textContent).toBe("rendered")
      el.remove()
    })

    test("render() is called during connectedCallback", () => {
      const renderSpy = vi.fn(() => document.createElement("div"))
      const { mount, TestComponent } = makeTestComponent()
      // Patch render onto the prototype after class creation
      ;(TestComponent.prototype as unknown as { render: typeof renderSpy }).render = renderSpy
      mount()
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })

    test("when render() returns `this`, nothing extra is appended", () => {
      const { mount } = makeTestComponent() // renderChild omitted → returns `this`
      const el = mount()
      expect(el.children).toHaveLength(0)
      el.remove()
    })
  })

  describe("lifecycle hooks", () => {
    test("onConnect() is called after render() during connectedCallback", () => {
      const onConnectSpy = vi.fn()
      const { mount } = makeTestComponent({ spies: { onConnect: onConnectSpy } })
      mount()
      expect(onConnectSpy).toHaveBeenCalledTimes(1)
    })

    test("onDisconnect() is called during disconnectedCallback", () => {
      const onDisconnectSpy = vi.fn()
      const { mount } = makeTestComponent({ spies: { onDisconnect: onDisconnectSpy } })
      const el = mount()
      expect(onDisconnectSpy).not.toHaveBeenCalled()
      el.remove()
      expect(onDisconnectSpy).toHaveBeenCalledTimes(1)
    })

    test("configureAria() is called before render() in connectedCallback", () => {
      const order: string[] = []
      const { mount, TestComponent } = makeTestComponent({
        spies: { configureAria: vi.fn(() => order.push("aria")) },
      })
      ;(TestComponent.prototype as unknown as { render: (this: HTMLElement) => HTMLElement }).render = vi.fn(function (
        this: HTMLElement,
      ) {
        order.push("render")
        return this
      })
      mount()
      expect(order).toEqual(["aria", "render"])
    })
  })

  describe("AbortController", () => {
    test("abort signal is not aborted while the element is connected", () => {
      const { mount } = makeTestComponent()
      const el = mount()
      expect(el.abortSignal.aborted).toBe(false)
      el.remove()
    })

    test("abort signal is aborted after disconnectedCallback", () => {
      const { mount } = makeTestComponent()
      const el = mount()
      el.remove()
      expect(el.abortSignal.aborted).toBe(true)
    })
  })

  describe("destroy()", () => {
    test("removes the element from the DOM", () => {
      const { mount } = makeTestComponent()
      const el = mount()
      expect(document.body.contains(el)).toBe(true)
      el.destroy()
      expect(document.body.contains(el)).toBe(false)
    })
  })

  describe("shadowMode", () => {
    test("shadowMode getter returns undefined by default", () => {
      const { mount } = makeTestComponent()
      const el = mount()
      expect(el.shadowMode).toBeUndefined()
      el.remove()
    })

    test("shadowMode getter returns the value it was set to", () => {
      const { mount } = makeTestComponent({ shadowMode: "open" })
      const el = mount()
      expect(el.shadowMode).toBe("open")
      el.remove()
    })
  })
})
