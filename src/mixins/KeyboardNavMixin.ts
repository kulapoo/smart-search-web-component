import type { Constructor } from "@/mixins/types"

export interface KeyboardNavHost {
  activeIndex: number
  resetActiveIndex(): void
  handleKeyboardNav(e: KeyboardEvent): void
}

export function KeyboardNavMixin<T extends Constructor<HTMLElement>>(Base: T) {
  class KeyboardNavMixinClass extends Base {
    #activeIndex = -1

    get activeIndex() {
      return this.#activeIndex
    }

    resetActiveIndex(): void {
      if (this.#activeIndex >= 0) {
        const items = this.getNavigableItems()
        this.#activeIndex = -1
        this.onActiveIndexChanged(-1, items)
      } else {
        this.#activeIndex = -1
      }
    }

    protected getNavigableItems(): HTMLElement[] {
      return []
    }

    protected handleKeyboardNav(e: KeyboardEvent): void {
      const items = this.getNavigableItems()
      if (!items.length) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          this.#activeIndex = Math.min(this.#activeIndex + 1, items.length - 1)
          break
        case "ArrowUp":
          e.preventDefault()
          this.#activeIndex = this.#activeIndex <= 0 ? items.length - 1 : this.#activeIndex - 1
          break
        case "Home":
          e.preventDefault()
          this.#activeIndex = 0
          break
        case "End":
          e.preventDefault()
          this.#activeIndex = items.length - 1
          break
        default:
          return
      }
      this.onActiveIndexChanged(this.#activeIndex, items)
    }

    protected onActiveIndexChanged(_index: number, _items: HTMLElement[]): void {}
  }

  return KeyboardNavMixinClass as T & Constructor<KeyboardNavMixinClass>
}
