import type { Constructor } from "@/mixins/types"

export function FormAssociatedMixin<T extends Constructor<HTMLElement>>(Base: T) {
  class FormAssociatedMixinClass extends Base {
    static formAssociated = true
    #internals: ElementInternals

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args)
      this.#internals = this.attachInternals()
    }

    get form() {
      return this.#internals.form
    }
    get validity() {
      return this.#internals.validity
    }
    get validationMessage() {
      return this.#internals.validationMessage
    }
    get willValidate() {
      return this.#internals.willValidate
    }

    setFormValue(value: string | null): void {
      this.#internals.setFormValue(value)
    }

    setValidity(flags: ValidityStateFlags, message?: string): void {
      const anchor = this.shadowRoot?.querySelector("input") ?? undefined
      this.#internals.setValidity(flags, message, anchor)
    }
  }

  return FormAssociatedMixinClass as T & Constructor<FormAssociatedMixinClass>
}
