import { h } from "@/utils/h"
import { Component } from "@/components/Component"
import { compose } from "@/mixins/compose"
import type { Constructor } from "@/mixins/types"
import { DisabledMixin } from "@/mixins/DisabledMixin"
import { FormAssociatedMixin } from "@/mixins/FormAssociatedMixin"
import { debounce } from "@/utils/debounce"

export interface InputOptions {
  name: string
  onInput?: (value: string, sourceEvent: Event | null) => void
  onBlur?: (value: string, sourceEvent: Event | null) => void
  onFocus?: (value: string, sourceEvent: Event | null) => void
  onClear?: () => void
}

const InputBase = compose(Component, DisabledMixin, FormAssociatedMixin) as Constructor<Component>

export class Input extends InputBase {
  static tagName = "ss-input"
  static clearClassName = "ss-input-clear"
  static hasValueClass = "has-value"

  static get observedAttributes(): string[] {
    return ["placeholder", "clearable", "debounce"]
  }

  #onInput: InputOptions["onInput"]
  #onClear: InputOptions["onClear"]
  #onBlur: InputOptions["onBlur"]
  #onFocus: InputOptions["onFocus"]
  #name: string
  #inputEl!: HTMLInputElement
  #clearButton!: HTMLButtonElement

  constructor({ name, onInput, onBlur, onFocus, onClear }: InputOptions) {
    super()
    this.#name = name
    this.#onInput = onInput
    this.#onBlur = onBlur
    this.#onFocus = onFocus
    this.#onClear = onClear
    this.#clearButton = h(
      "button",
      { type: "button", class: Input.clearClassName, "aria-label": "Clear", onclick: this.#handleClear },
      "\u00d7",
    ) as HTMLButtonElement
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === "placeholder" && this.#inputEl) {
      this.#inputEl.placeholder = value ?? ""
    } else if (name === "clearable" && this.#inputEl) {
      this.#toggleClearButton(value !== null)
    }
  }

  #handleInput = (e: Event): void => {
    const input = e.currentTarget as HTMLInputElement
    this.#toggleClearVisible(input.value.length > 0)
    const debounceMs = this.getAttribute("debounce")

    if (debounceMs !== null) {
      debounce((value: string, sourceEvent: Event) => {
        this.#onInput?.(value, sourceEvent)
      }, parseInt(debounceMs))(input.value, e)
    } else {
      this.#onInput?.(input.value, e)
    }
  }

  #handleBlur = (e: Event): void => {
    const input = e.currentTarget as HTMLInputElement
    this.#toggleClearVisible(input.value.length > 0)
    this.#onBlur?.(input.value, e)
  }

  #handleFocus = (e: Event): void => {
    const input = e.currentTarget as HTMLInputElement
    this.#toggleClearVisible(input.value.length > 0)
    this.#onFocus?.(input.value, e)
  }

  #handleClear = (): void => {
    this.#inputEl.value = ""
    this.#toggleClearVisible(false)
    this.#onClear?.()
    this.#onInput?.("", null)
    this.#inputEl.focus()
  }

  #toggleClearVisible(hasValue: boolean): void {
    this.classList.toggle(Input.hasValueClass, hasValue)
  }

  #toggleClearButton(show: boolean): void {
    this.#clearButton.hidden = !show
  }

  protected render(): HTMLElement {
    const placeholder = this.getAttribute("placeholder") ?? ""
    const showClear = this.getAttribute("clearable") !== null

    this.#inputEl = h("input", {
      type: "text",
      placeholder,
      autocomplate: "off",
      name: this.#name,
      oninput: this.#handleInput,
      onblur: this.#handleBlur,
      onfocus: this.#handleFocus,
    }) as HTMLInputElement

    this.#clearButton.hidden = !showClear

    this.append(this.#inputEl, this.#clearButton)
    return this
  }

  protected onDisconnect(): void {
    this.#inputEl.removeEventListener("input", this.#handleInput)
    this.#inputEl.removeEventListener("blur", this.#handleBlur)
    this.#inputEl.removeEventListener("focus", this.#handleFocus)
    this.#clearButton.removeEventListener("click", this.#handleClear)
  }
}
