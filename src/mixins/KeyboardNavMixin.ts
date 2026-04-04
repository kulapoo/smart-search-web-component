import type { Constructor } from "@/mixins/types"

export function KeyboardNavMixin<T extends Constructor<HTMLElement>>(Base: T) {
  class KeyboardNavMixinClass extends Base {
    #activeIndex = -1

    get activeIndex() {
      return this.#activeIndex
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
          this.#activeIndex = Math.max(this.#activeIndex - 1, 0)
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
