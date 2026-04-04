/**
 * Vitest global setup for jsdom environment.
 *
 * jsdom does not implement ResizeObserver or scrollIntoView — both are used
 * by smart-search's positioning logic. We provide no-op stubs here so tests
 * can focus on component behaviour without needing layout calculations.
 */

// Stub ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

// Stub scrollIntoView (used by the component after keyboard navigation)
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// Stub window.scrollX / scrollY (used by positioning util, not always present in jsdom)
Object.defineProperty(window, "scrollX", { value: 0, writable: true })
Object.defineProperty(window, "scrollY", { value: 0, writable: true })
