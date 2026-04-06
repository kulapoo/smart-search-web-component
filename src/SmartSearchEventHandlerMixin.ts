import type { Menu } from "@/components/Menu/Menu"
import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import { fireEvent } from "@/utils/events"
import type { Constructor } from "@/mixins/types"
import { SmartSearchEventNames } from "@/SmartSearchConstants"
import type { KeyboardNavHost } from "@/mixins/KeyboardNavMixin"
import type { WithGetAttrs, WithLoadData, WithActiveFilters, WithInputEl } from "@/types/traits"

export interface SmartSearchEventHandlers {
  menuInstance: Menu
  handleMenuOpen(): void
  handleMenuClose(): void
  handleInput(value: string, sourceEvent: Event | null): void
  handleInputBlur(value: string, sourceEvent: Event | null): void
  handleInputFocus(value: string, sourceEvent: Event | null): void
  handleClear(): void
  handleSelect(value: string, result: SearchResult, sourceEvent: Event): void
  handleInputKeydown(e: KeyboardEvent): void
  handleFilterChange(e: CustomEvent): void
  handlePointerMoveOnMenu(): void
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
      if (this.contains(document.activeElement)) {
        inputEl?.focus()
      }
      self.resetActiveIndex?.()
    }

    handleInput = (value: string, sourceEvent: Event | null): void => {
      if (this.hasAttribute("disabled")) return
      const attrs = (this as unknown as WithGetAttrs).getAttrs()
      fireEvent(this, SmartSearchEventNames.INPUT_CHANGE, { value, sourceEvent })

      const meetsMinChars = value.length >= (attrs.minChars ?? 0)

      if (!meetsMinChars) {
        this.menuInstance.hide()
        return
      }

      if (attrs.fetchDataOn === "input" || attrs.fetchDataOn === "input-focus") {
        const activeFilters = (this as unknown as WithActiveFilters).getActiveFilters()
        ;(this as unknown as WithLoadData).loadData(value, activeFilters)
      }

      if (String(value || "").trim().length > 0 && attrs.openMenuOnInput) {
        this.menuInstance.show()
      }
    }

    handleInputBlur = (value: string, sourceEvent: Event | null): void => {
      if (this.hasAttribute("disabled")) return
      fireEvent(this, SmartSearchEventNames.INPUT_BLUR, { value, sourceEvent })
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
      const meetsMinChars = value.length >= (attrs.minChars ?? 0)

      if (meetsMinChars && (attrs.fetchDataOn === "focus" || attrs.fetchDataOn === "input-focus")) {
        const activeFilters = (this as unknown as WithActiveFilters).getActiveFilters()
        ;(this as unknown as WithLoadData).loadData(value, activeFilters)
      }

      if (meetsMinChars && String(value || "").trim().length > 0 && attrs.openMenuOnFocus) {
        this.menuInstance.show()
      }
    }

    handleClear = (): void => {
      this.handleMenuClose()
    }

    handleSelect = (value: string, result: SearchResult, sourceEvent: Event): void => {
      fireEvent(this, SmartSearchEventNames.MENU_SELECT, { value, result, sourceEvent })
      const inputEl = (this as unknown as { getInputEl?(): HTMLInputElement }).getInputEl?.()
      if (inputEl) {
        inputEl.value = result.label
      }
      this.handleMenuClose()
    }

    handleInputKeydown = (e: KeyboardEvent): void => {
      if (!this.menuInstance.isOpen) return
      const keyNav = this as unknown as KeyboardNavHost & { getNavigableItems(): HTMLElement[] }

      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp":
        case "Home":
        case "End":
          keyNav.handleKeyboardNav(e)
          this.menuInstance.setAttribute("data-keyboard-nav", "")
          break
        case "Enter": {
          e.preventDefault()
          const items = keyNav.getNavigableItems()
          const active = items[keyNav.activeIndex]
          active?.click()
          break
        }
        case "Tab":
          this.handleMenuClose()
          break
        case "Escape":
          e.preventDefault()
          this.handleMenuClose()
          break
      }
    }

    handleFilterChange = (_e: CustomEvent): void => {
      const activeFilters = (this as unknown as WithActiveFilters).getActiveFilters()
      fireEvent(this, SmartSearchEventNames.FILTER_CHANGE, { filters: activeFilters })
      const searchTerm = (this as unknown as WithInputEl).getInputEl().value
      ;(this as unknown as WithLoadData).loadData(searchTerm, activeFilters)
    }

    handlePointerMoveOnMenu = (): void => {
      this.menuInstance.removeAttribute("data-keyboard-nav")
    }
  }
}
