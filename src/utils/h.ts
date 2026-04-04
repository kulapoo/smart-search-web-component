type Child = Node | string | number | false | null | undefined

type HProps = Record<string, string | number | boolean | EventListenerOrEventListenerObject | null | undefined> | null

// simplified version of Stencil's h() function - https://raw.githubusercontent.com/ionic-team/stencil/main/src/runtime/vdom/h.ts
export function h(maybeElementOrTag: string | HTMLElement, props?: HProps, ...children: Child[]): HTMLElement {
  const el = typeof maybeElementOrTag === "string" ? document.createElement(maybeElementOrTag) : maybeElementOrTag

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value == null || value === false) continue

      if (key.startsWith("on") && typeof value === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), value as EventListener)
      } else if (value === true) {
        el.setAttribute(key, "")
      } else {
        el.setAttribute(key, String(value))
      }
    }
  }

  for (const child of children) {
    if (child == null || child === false) continue
    el.appendChild(
      typeof child === "string" || typeof child === "number" ? document.createTextNode(String(child)) : child,
    )
  }

  return el
}
