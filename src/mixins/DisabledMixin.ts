import type { Constructor } from "@/mixins/types"

export interface DisabledHost {
  disabled: boolean
}

export function DisabledMixin<T extends Constructor<HTMLElement>>(Base: T) {
  class DisabledMixinClass extends Base implements DisabledHost {
    get disabled(): boolean {
      return this.hasAttribute("disabled")
    }

    set disabled(value: boolean) {
      if (value) {
        this.setAttribute("disabled", "")
      } else {
        this.removeAttribute("disabled")
      }
    }

    attributeChangedCallback(name: string, old: string | null, value: string | null) {
      // @ts-expect-error — super may not declare this method; safe to call optionally
      super.attributeChangedCallback?.(name, old, value)
      if (name === "disabled") {
        this.setAttribute("aria-disabled", String(value !== null))
      }
    }
  }

  const baseAttrs = (Base as unknown as { observedAttributes?: string[] }).observedAttributes ?? []
  Object.defineProperty(DisabledMixinClass, "observedAttributes", {
    get() {
      return [...baseAttrs, "disabled"]
    },
  })

  return DisabledMixinClass as Constructor<DisabledHost> & T
}
