import type { Menu } from "@/components/Menu/Menu"
import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import { fireEvent } from "@/utils/events"
import type { Constructor } from "@/mixins/types"
import { SmartSearchEventNames } from "@/SmartSearchConstants"

export interface SmartSearchEventHandlers {
  menuInstance: Menu
  handleMenuOpen(): void
  handleMenuClose(): void
  handleInput(value: string, sourceEvent: Event | null): void
  handleInputBlur(): void
  handleInputFocus(): void
  handleClear(): void
  handleSelect(value: string, result: SearchResult, sourceEvent: Event): void
}

export function SmartSearchEventHandlerMixin<T extends Constructor<HTMLElement>>(Base: T) {
  return class SmartSearchWithEventHandlers extends Base implements SmartSearchEventHandlers {
    declare menuInstance: Menu

    handleMenuOpen = (): void => {
      this.menuInstance.show()
    }

    handleMenuClose = (): void => {
      this.menuInstance.hide()
    }

    handleInput = (value: string, sourceEvent: Event | null): void => {
      fireEvent(this, SmartSearchEventNames.INPUT_CHANGE, { value, sourceEvent })
    }

    handleInputBlur = (): void => {
      this.handleMenuClose()
    }

    handleInputFocus = (): void => {
      this.handleMenuOpen()
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
