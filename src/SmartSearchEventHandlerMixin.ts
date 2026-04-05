import type { Menu } from "@/components/Menu/Menu"
import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import { fireEvent } from "@/utils/events"
import type { Constructor } from "@/mixins/types"
import { SmartSearchEventNames } from "@/SmartSearchConstants"
import type { WithGetAttrs, WithLoadData } from "./SmartSearch"

export interface WithInputEl {
  getInputEl(): HTMLInputElement
}

export interface SmartSearchEventHandlers {
  menuInstance: Menu
  handleMenuOpen(): void
  handleMenuClose(): void
  handleInput(value: string, sourceEvent: Event | null): void
  handleInputBlur(): void
  handleInputFocus(value: string, sourceEvent: Event | null): void
  handleClear(): void
  handleSelect(value: string, result: SearchResult, sourceEvent: Event): void
}

export function SmartSearchEventHandlerMixin<T extends Constructor<HTMLElement>>(Base: T) {
  return class SmartSearchWithEventHandlers extends Base implements SmartSearchEventHandlers {
    declare menuInstance: Menu

    handleMenuOpen = (): void => {
      this.menuInstance.show()
      const self = this as unknown as { getInputEl?(): HTMLInputElement }
      self.getInputEl?.().setAttribute("aria-expanded", "true")
    }

    handleMenuClose = (): void => {
      this.menuInstance.hide()
      const self = this as unknown as { getInputEl?(): HTMLInputElement; resetActiveIndex?(): void }
      const inputEl = self.getInputEl?.()
      inputEl?.setAttribute("aria-expanded", "false")
      inputEl?.focus()
      self.resetActiveIndex?.()
    }

    handleInput = (value: string, sourceEvent: Event | null): void => {
      if (this.hasAttribute("disabled")) return
      const attrs = (this as unknown as WithGetAttrs).getAttrs()
      fireEvent(this, SmartSearchEventNames.INPUT_CHANGE, { value, sourceEvent })

      if (attrs.fetchDataOn === "input") {
        ;(this as unknown as WithLoadData).loadData()
      }

      console.log("handleInput", attrs)
      if (attrs.openMenuOnInput) {
        this.menuInstance.show()
      }
    }

    handleInputBlur = (): void => {
      if (this.hasAttribute("disabled")) return
      const attrs = (this as unknown as WithGetAttrs).getAttrs()

      if (attrs.closeMenuOnBlur) {
        // Delay to allow pointerdown on menu items to register before closing
        requestAnimationFrame(() => {
          const inputEl = (this as unknown as { getInputEl?(): HTMLInputElement }).getInputEl?.()
          if (!this.menuInstance.contains(document.activeElement) && document.activeElement !== inputEl) {
            this.menuInstance.hide()
            ;(this as unknown as { resetActiveIndex?(): void }).resetActiveIndex?.()
          }
        })
      }
    }

    handleInputFocus = (value: string, sourceEvent: Event | null): void => {
      if (this.hasAttribute("disabled")) return
      fireEvent(this, SmartSearchEventNames.INPUT_FOCUS, { value, sourceEvent })
      const attrs = (this as unknown as WithGetAttrs).getAttrs()
      if (attrs.fetchDataOn === "focus") {
        ;(this as unknown as WithLoadData).loadData()
      }

      if (attrs.openMenuOnFocus) {
        this.menuInstance.show()
      }
    }

    handleClear = (): void => {
      this.handleMenuClose()
    }

    handleSelect = (value: string, result: SearchResult, sourceEvent: Event): void => {
      fireEvent(this, SmartSearchEventNames.MENU_SELECT, { value, result, sourceEvent })
      this.handleMenuClose()
    }
  }
}
