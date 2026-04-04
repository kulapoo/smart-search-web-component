export interface MenuPosition {
  top: number
  left: number
  width: number
  maxHeight: number
  placement: "below" | "above"
}

const GAP = 4
const MAX_MENU_HEIGHT = 360
const MIN_MENU_HEIGHT = 120

export function calculateMenuPosition(anchor: DOMRect): MenuPosition {
  const spaceBelow = window.innerHeight - anchor.bottom - GAP
  const spaceAbove = anchor.top - GAP

  let top: number
  let maxHeight: number
  let placement: "below" | "above"

  if (spaceBelow >= MIN_MENU_HEIGHT || spaceBelow >= spaceAbove) {
    // Place below
    top = anchor.bottom + GAP
    maxHeight = Math.min(MAX_MENU_HEIGHT, Math.max(MIN_MENU_HEIGHT, spaceBelow))
    placement = "below"
  } else {
    // Flip above
    maxHeight = Math.min(MAX_MENU_HEIGHT, Math.max(MIN_MENU_HEIGHT, spaceAbove))
    top = anchor.top - maxHeight - GAP
    placement = "above"
  }

  return {
    top,
    left: anchor.left,
    width: anchor.width,
    maxHeight,
    placement,
  }
}
