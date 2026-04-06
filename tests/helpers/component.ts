import { vi, type Mock } from "vitest"
import { Component, type ShadowMode } from "@/components/Component"

/** Avoid `ReturnType<typeof vi.fn>` resolving to `Mock<Procedure | Constructable>` (not callable). */
type SpyFn = Mock<(...args: any[]) => any>

let counter = 0

export interface TestComponentOptions {
  shadowMode?: ShadowMode
  renderChild?: () => HTMLElement
  spies?: {
    onConnect?: SpyFn
    onDisconnect?: SpyFn
    configureAria?: SpyFn
  }
}

export interface TestComponentInstance extends Component {
  onConnectSpy: SpyFn
  onDisconnectSpy: SpyFn
  configureAriaSpy: SpyFn
  readonly abortSignal: AbortSignal
}

export function makeTestComponent(options: TestComponentOptions = {}) {
  const { shadowMode, renderChild, spies = {} } = options
  const tag = `test-component-${counter++}`

  const onConnectSpy = spies.onConnect ?? vi.fn<(...args: any[]) => any>()
  const onDisconnectSpy = spies.onDisconnect ?? vi.fn<(...args: any[]) => any>()
  const configureAriaSpy = spies.configureAria ?? vi.fn<(...args: any[]) => any>()

  class TestComponent extends Component implements TestComponentInstance {
    static tagName = tag

    readonly onConnectSpy = onConnectSpy
    readonly onDisconnectSpy = onDisconnectSpy
    readonly configureAriaSpy = configureAriaSpy

    get abortSignal(): AbortSignal {
      return this.abort.signal
    }

    constructor() {
      super()
      if (shadowMode !== undefined) {
        this.shadowMode = shadowMode
      }
    }

    protected configureAria(): void {
      configureAriaSpy()
    }

    protected render(): HTMLElement {
      if (renderChild) {
        return renderChild()
      }
      return this
    }

    protected onConnect(): void {
      onConnectSpy()
    }

    protected onDisconnect(): void {
      onDisconnectSpy()
    }
  }

  customElements.define(tag, TestComponent)

  function mount(): TestComponentInstance {
    const el = document.createElement(tag) as TestComponentInstance
    document.body.appendChild(el)
    return el
  }

  return { mount, tag, TestComponent }
}
