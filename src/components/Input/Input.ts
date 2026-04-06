import { Menu } from "@/components/Menu/Menu"
import { h } from "@/utils/h"
import { Component } from "@/components/Component"
import { compose } from "@/mixins/compose"
import type { Constructor } from "@/mixins/types"
import { DisabledMixin } from "@/mixins/DisabledMixin"
import { FormAssociatedMixin } from "@/mixins/FormAssociatedMixin"
import { debounce } from "@/utils/debounce"
import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import { X } from "lucide"
import { createIcon } from "@/utils/icon"

export interface InputOptions {
  name: string
  menuId?: string
  onInput?: (value: string, sourceEvent: Event | null) => void
  onBlur?: (value: string, sourceEvent: Event | null) => void
  onFocus?: (value: string, sourceEvent: Event | null) => void
  onClear?: () => void
  onRemoveChip?: (value: string) => void
}

const InputBase = compose(Component, DisabledMixin, FormAssociatedMixin) as Constructor<Component>

export class Input extends InputBase {
  static tagName = "ss-input"
  static clearClassName = "ss-input-clear"
  static hasValueClass = "has-value"

  static get observedAttributes(): string[] {
    return ["placeholder", "clearable", "debounce", "maxlength", "disabled"]
  }

  #onInput: InputOptions["onInput"]
  #onClear: InputOptions["onClear"]
  #onBlur: InputOptions["onBlur"]
  #onFocus: InputOptions["onFocus"]
  #onRemoveChip: InputOptions["onRemoveChip"]
  #name: string
  #inputEl!: HTMLInputElement
  #clearButton!: HTMLButtonElement
  #chipsEl!: HTMLElement

  #menuId: string
  #debouncedOnInput: ReturnType<typeof debounce> | null = null
  #debouncedDelayMs: number | null = null

  constructor({ name, menuId, onInput, onBlur, onFocus, onClear, onRemoveChip }: InputOptions) {
    super()
    this.#name = name
    this.#menuId = menuId ?? Menu.listboxId
    this.#onInput = onInput
    this.#onBlur = onBlur
    this.#onFocus = onFocus
    this.#onClear = onClear
    this.#onRemoveChip = onRemoveChip
    this.#clearButton = h(
      "button",
      { type: "button", class: Input.clearClassName, "aria-label": "Clear" },
      createIcon(X, 16),
    ) as HTMLButtonElement
    this.#chipsEl = h("div", { class: "ss-input-chips" }) as HTMLElement
  }

  attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback?.(name, old, value)
    if (name === "placeholder" && this.#inputEl) {
      this.#inputEl.placeholder = value ?? ""
    } else if (name === "clearable" && this.#inputEl) {
      this.#toggleClearButton(value !== null && value !== "false")
    } else if (name === "maxlength" && this.#inputEl) {
      if (value !== null) {
        this.#inputEl.maxLength = parseInt(value)
      } else {
        this.#inputEl.removeAttribute("maxlength")
      }
    } else if (name === "debounce") {
      this.#debouncedOnInput = null
      this.#debouncedDelayMs = null
    }
  }

  #handleInput = (e: Event): void => {
    const input = e.currentTarget as HTMLInputElement
    this.#toggleClearVisible(input.value.length > 0)
    const debounceAttr = this.getAttribute("debounce")

    if (debounceAttr !== null) {
      const delayMs = parseInt(debounceAttr, 10)
      if (this.#debouncedOnInput === null || this.#debouncedDelayMs !== delayMs) {
        this.#debouncedOnInput = debounce((value: string, sourceEvent: Event) => {
          this.#onInput?.(value, sourceEvent)
        }, delayMs)
        this.#debouncedDelayMs = delayMs
      }
      this.#debouncedOnInput(input.value, e)
    } else {
      this.#debouncedOnInput = null
      this.#debouncedDelayMs = null
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

  #handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Backspace" && this.#inputEl.value === "") {
      const chips = this.#chipsEl.querySelectorAll<HTMLElement>("[data-value]")
      const lastChip = chips[chips.length - 1]
      if (lastChip?.dataset.value) {
        this.#onRemoveChip?.(lastChip.dataset.value)
      }
    }
  }

  #toggleClearVisible(hasValue: boolean): void {
    const hasChips = this.#chipsEl?.children.length > 0
    this.classList.toggle(Input.hasValueClass, hasValue || hasChips)
  }

  #toggleClearButton(show: boolean): void {
    this.#clearButton.hidden = !show
  }

  getMenuId(): string {
    return this.#menuId
  }

  protected configureAria(): void {
    this.setAttribute("aria-controls", this.#menuId)
    this.setAttribute("aria-autocomplete", "list")
    this.setAttribute("aria-expanded", "false")
    this.setAttribute("autocomplete", "off")
  }

  get inputElement(): HTMLInputElement {
    return this.#inputEl
  }

  updateChips(items: SearchResult[]): void {
    const chipEls = items.map((item) => {
      const removeBtn = h(
        "button",
        {
          type: "button",
          class: "ss-input-chip-remove",
          "aria-label": `Remove ${item.label}`,
          onClick: () => this.#onRemoveChip?.(item.value),
        },
        createIcon(X, 12),
      )
      return h(
        "span",
        { class: "ss-input-chip", "data-value": item.value },
        h("span", { class: "ss-input-chip-label" }, item.label),
        removeBtn,
      )
    })
    this.#chipsEl.replaceChildren(...chipEls)
    this.classList.toggle("has-chips", items.length > 0)
    this.#toggleClearVisible(this.#inputEl?.value.length > 0)
  }

  setMultiValue(value: string | null): void {
    ;(this as unknown as { setFormValue(v: string | null): void }).setFormValue(value)
  }

  protected render(): HTMLElement {
    const placeholder = this.getAttribute("placeholder") ?? ""
    const clearAttr = this.getAttribute("clearable")
    const showClear = clearAttr !== null && clearAttr !== "false"
    const maxlength = this.getAttribute("maxlength")

    this.#inputEl = h("input", {
      type: "text",
      role: "combobox",
      "aria-expanded": "false",
      "aria-autocomplete": "list",
      "aria-controls": this.#menuId,
      "aria-activedescendant": "",
      placeholder,
      autocomplete: "off",
      name: this.#name,
      maxlength: maxlength ?? undefined,
    }) as HTMLInputElement

    const opts = { signal: this.abort.signal }
    this.#inputEl.addEventListener("input", this.#handleInput, opts)
    this.#inputEl.addEventListener("blur", this.#handleBlur, opts)
    this.#inputEl.addEventListener("focus", this.#handleFocus, opts)
    this.#inputEl.addEventListener("keydown", this.#handleKeydown, opts)
    this.#clearButton.addEventListener("click", this.#handleClear, opts)

    this.#clearButton.hidden = !showClear

    this.append(this.#chipsEl, this.#inputEl, this.#clearButton)
    return this
  }
}
