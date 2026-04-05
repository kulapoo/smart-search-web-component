import { inputStyles } from "@/components/Input/Input.styles"
import { menuStyles } from "@/components/Menu/Menu.styles"
import { filterOptionsStyles, filterOptionStyles } from "@/components/Filter/Filter.styles"
import { tokens } from "@/styles/tokens"

export const rootStyles = `
  :host {
    display: block;
    position: relative;
  }
`

export const createStyles = (styleParams: string[]) => {
  return [tokens, rootStyles, inputStyles, menuStyles, filterOptionsStyles, filterOptionStyles, ...styleParams].map(
    (cssText) => {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(cssText)
      return sheet
    },
  )
}
