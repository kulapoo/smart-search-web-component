export type ShadowMode = "open" | "closed" // "closed" is not recommended according to the web components https://lists.w3.org/Archives/Public/public-webapps-github/2020Aug/0414.html;

// mimicking Stencil's Component class
export abstract class Component extends HTMLElement {
  #shadowMode: ShadowMode | undefined = undefined
  protected readonly abort = new AbortController()
  static tagName: string | undefined = undefined

  protected abstract render(): HTMLElement
  protected configureAria(): void {}
  protected onConnect(): void {}
  protected onDisconnect(): void {}

  set shadowMode(shadowMode: ShadowMode | undefined) {
    this.#shadowMode = shadowMode
  }

  get shadowMode(): ShadowMode | undefined {
    return this.#shadowMode
  }

  connectedCallback(): void {
    this.configureAria()

    const rendered = this.render()
    if (rendered !== this) {
      if (this.#shadowMode) {
        this.attachShadow({ mode: this.#shadowMode }).appendChild(rendered)
      } else {
        this.appendChild(rendered)
      }
    }
    this.onConnect()
  }

  disconnectedCallback(): void {
    this.onDisconnect()
    this.abort.abort()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  attributeChangedCallback(_name: string, _old: string | null, _value: string | null): void {}

  destroy(): void {
    this.remove()
  }
}
