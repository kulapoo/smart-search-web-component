import { computePosition, autoUpdate, flip, offset, size } from "@floating-ui/dom"
import { Component } from "@/components/Component"

export interface MenuOptions {
  anchor: HTMLElement
  onClose: () => void
}

export class Menu extends Component {
  static tagName = "ss-menu"
  static listClassName = "ss-menu-list"

  #options: MenuOptions
  #cleanupAutoUpdate: (() => void) | null = null
  #clickOutsideAbort: AbortController | null = null

  constructor(options: MenuOptions) {
    super()
    this.#options = options
  }

  show = (): void => {
    if (this.hasAttribute("open")) return
    this.setAttribute("open", "")
    this.#startPositioning()
    this.#startClickOutside()
  }

  hide = (): void => {
    if (!this.hasAttribute("open")) return
    this.removeAttribute("open")
    this.#stopPositioning()
    this.#stopClickOutside()
  }

  get isOpen(): boolean {
    return this.hasAttribute("open")
  }

  handleKeydown(e: KeyboardEvent): void {
    if (e.key !== "Escape") return
    e.preventDefault()
    this.#options.onClose()
  }

  protected configureAria(): void {
    this.setAttribute("role", "region")
    this.setAttribute("aria-label", "Menu")
  }

  protected render(): HTMLElement {
    this.classList.add(Menu.listClassName)
    return this
  }

  protected onDisconnect(): void {
    this.#stopPositioning()
    this.#stopClickOutside()
  }

  #startPositioning(): void {
    const { anchor } = this.#options
    this.#cleanupAutoUpdate = autoUpdate(anchor, this, () => {
      computePosition(anchor, this, {
        placement: "bottom-start",
        middleware: [
          offset(4),
          flip({ fallbackPlacements: ["top-start"] }),
          size({
            apply: ({ availableHeight, rects }) => {
              Object.assign(this.style, {
                maxHeight: `${Math.min(360, availableHeight)}px`,
                width: `${rects.reference.width}px`,
              })
            },
          }),
        ],
      }).then(({ x, y, placement }) => {
        Object.assign(this.style, { left: `${x}px`, top: `${y}px` })
        this.setAttribute("placement", placement.startsWith("top") ? "above" : "below")
      })
    })
  }

  #stopPositioning(): void {
    this.#cleanupAutoUpdate?.()
    this.#cleanupAutoUpdate = null
  }

  #startClickOutside(): void {
    this.#clickOutsideAbort = new AbortController()
    document.addEventListener("pointerdown", this.#onClickOutside, {
      signal: this.#clickOutsideAbort.signal,
    })
  }

  #stopClickOutside(): void {
    this.#clickOutsideAbort?.abort()
    this.#clickOutsideAbort = null
  }

  #onClickOutside = (e: PointerEvent): void => {
    const { anchor, onClose } = this.#options
    const target = e.target as Node
    if (!this.contains(target) && !anchor.contains(target)) {
      onClose()
    }
  }
}
