import { createElement } from "lucide"
import type { IconNode } from "lucide"

export function createIcon(iconNode: IconNode, size = 16): SVGElement {
  return createElement(iconNode, { width: size, height: size }) as SVGElement
}
