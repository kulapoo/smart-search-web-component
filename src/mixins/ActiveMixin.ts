import type { Constructor } from "@/mixins/types"

export interface ActiveHost {
  active: boolean
}

export function ActiveMixin<T extends Constructor<HTMLElement>>(Base: T) {
  class ActiveMixinClass extends Base implements ActiveHost {
    get active(): boolean {
      return this.hasAttribute("active")
    }

    set active(value: boolean) {
      if (value) {
        this.setAttribute("active", "")
      } else {
        this.removeAttribute("active")
      }
    }

    attributeChangedCallback(name: string, old: string | null, value: string | null) {
      // @ts-expect-error — super may not declare this method; safe to call optionally
      super.attributeChangedCallback?.(name, old, value)
      if (name === "active") {
        this.setAttribute("aria-selected", String(value !== null))
      }
    }
  }

  const baseAttrs = (Base as unknown as { observedAttributes?: string[] }).observedAttributes ?? []
  Object.defineProperty(ActiveMixinClass, "observedAttributes", {
    get() {
      return [...baseAttrs, "active"]
    },
  })

  return ActiveMixinClass as Constructor<ActiveHost> & T
}
