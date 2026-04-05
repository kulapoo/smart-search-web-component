import { computePosition, autoUpdate, flip, offset, size } from "@floating-ui/dom"
import { Component } from "@/components/Component"
import { h } from "@/utils/h"

export interface MenuOptions {
  anchor: HTMLElement
  onClose: () => void
  maxHeight?: number
  offset?: number
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end"
  matchWidth?: boolean
  closeOnEscape?: boolean
  closeOnClickOutside?: boolean
}

export class Menu extends Component {
  static tagName = "ss-menu"
  static listClassName = "ss-menu-list"
  static listboxId = "ss-menu-listbox"

  #options: MenuOptions
  #cleanupAutoUpdate: (() => void) | null = null
  #clickOutsideAbort: AbortController | null = null

  #emptyEl = h("div", { class: "ss-menu-empty", role: "status", hidden: true }, "No results found")
  #loadingEl = h("div", { class: "ss-menu-loading", role: "status", "aria-live": "polite", hidden: true }, "Loading...")

  constructor(options: MenuOptions) {
    super()
    this.#options = options
  }

  get loading(): boolean {
    return !this.#loadingEl.hidden
  }

  set loading(v: boolean) {
    this.#loadingEl.hidden = !v
  }

  get empty(): boolean {
    return !this.#emptyEl.hidden
  }

  set empty(v: boolean) {
    this.#emptyEl.hidden = !v
  }

  show = (): void => {
    if (this.hasAttribute("open")) return
    this.setAttribute("open", "")
    this.#startPositioning()
    this.#startClickOutside()
  }

  hide = (): void => {
    if (!this.hasAttribute("open")) return
    this.#stopPositioning()
    this.#stopClickOutside()
    this.setAttribute("closing", "")

    let done = false
    const cleanup = () => {
      if (done) return
      done = true
      this.removeAttribute("open")
      this.removeAttribute("closing")
    }

    this.addEventListener("animationend", cleanup, { once: true })
    setTimeout(cleanup, 200)
  }

  get isOpen(): boolean {
    return this.hasAttribute("open")
  }

  handleKeydown(e: KeyboardEvent): void {
    if (this.#options.closeOnEscape === false) return
    if (e.key !== "Escape") return
    e.preventDefault()
    this.#options.onClose()
  }

  protected configureAria(): void {
    this.id = this.id || Menu.listboxId
    this.setAttribute("role", "listbox")
    this.setAttribute("aria-label", "Search results")
  }

  protected render(): HTMLElement {
    this.classList.add(Menu.listClassName)
    this.append(this.#loadingEl, this.#emptyEl)
    return this
  }

  protected onDisconnect(): void {
    this.#stopPositioning()
    this.#stopClickOutside()
  }

  #startPositioning(): void {
    const {
      anchor,
      maxHeight = 360,
      offset: offsetVal = 4,
      placement = "bottom-start",
      matchWidth = true,
    } = this.#options
    this.#cleanupAutoUpdate = autoUpdate(anchor, this, () => {
      computePosition(anchor, this, {
        placement,
        middleware: [
          offset(offsetVal),
          flip({ fallbackPlacements: [placement.startsWith("bottom") ? "top-start" : "bottom-start"] }),
          size({
            apply: ({ availableHeight, rects }) => {
              const styles: Partial<CSSStyleDeclaration> = {
                maxHeight: `${Math.min(maxHeight, availableHeight)}px`,
              }
              if (matchWidth) styles.width = `${rects.reference.width}px`
              Object.assign(this.style, styles)
            },
          }),
        ],
      }).then(({ x, y, placement: resolvedPlacement }) => {
        Object.assign(this.style, { left: `${x}px`, top: `${y}px` })
        this.setAttribute("placement", resolvedPlacement.startsWith("top") ? "above" : "below")
      })
    })
  }

  #stopPositioning(): void {
    this.#cleanupAutoUpdate?.()
    this.#cleanupAutoUpdate = null
  }

  #startClickOutside(): void {
    if (this.#options.closeOnClickOutside === false) return
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
