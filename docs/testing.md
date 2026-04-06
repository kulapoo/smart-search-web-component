# Testing Guide

Tests run in [jsdom](https://github.com/jsdom/jsdom) via [Vitest](https://vitest.dev/).

## Commands

```bash
# Run all tests once
vitest run

# Watch mode — re-runs affected files on save (best while writing tests)
vitest

# Run a single file
vitest run tests/components/FilterOptions.test.ts

# Run a whole folder
vitest run tests/utils/
```

## Structure

```
tests/
  setup.ts                    global jsdom stubs (ResizeObserver, scrollIntoView)
  helpers/
    index.ts                  unified harness — mount helpers, fixtures, factories
    component.ts              makeTestComponent() for base Component tests
  utils/                      one file per utility (debounce, h, highlight, …)
  mixins/                     one file per mixin (ActiveMixin, DisabledMixin, compose)
  components/                 one file per component (Input, Menu, SearchResultList, …)
  SmartSearch.test.ts         top-level integration tests
```

## Writing a test

Most test files already contain descriptive `// TODO` stubs. To fill one in, import the relevant mount helper from `../helpers` (already in place at the top of each file) and write your assertion.

### Example — component attribute

```ts
test("id is derived from value", () => {
  const el = mountFilterOption({ value: "laptops" })
  expect(el.id).toBe("filter-option-laptops")
  el.remove()
})
```

### Example — callback spy

```ts
test("onInput callback is called with value on native input event", () => {
  const onInput = vi.fn()
  const el = mountInput({ onInput })
  el.inputElement.value = "hello"
  el.inputElement.dispatchEvent(new Event("input", { bubbles: true }))
  expect(onInput).toHaveBeenCalledWith("hello", expect.any(Event))
  el.remove()
})
```

### Example — custom event

```ts
test("ss-menu-select fires on item select", () => {
  const el = mountSmartSearch()
  const received: CustomEvent[] = []
  el.addEventListener("ss-menu-select", (e) => received.push(e as CustomEvent))
  // … trigger selection …
  expect(received[0].detail.value).toBe("apple")
  el.remove()
})
```

## Helpers reference

Import from `"../helpers"` (or `"./helpers"` in `SmartSearch.test.ts`).

### Mount functions

Each function appends the element to `document.body` and returns it. All callbacks default to `vi.fn()` — pass overrides to spy on specific ones.

| Function                            | Returns                | Notes                                                |
| ----------------------------------- | ---------------------- | ---------------------------------------------------- |
| `mountInput(overrides?)`            | `Input`                | Defaults: `name="q"`, all callbacks stubbed          |
| `mountMenu(overrides?)`             | `{ el: Menu, anchor }` | Creates its own anchor element                       |
| `mountSearchResultItem(overrides?)` | `SearchResultItem`     | Default result: `{ label: "Apple", value: "apple" }` |
| `mountSearchResultList(overrides?)` | `SearchResultList`     |                                                      |
| `mountFilterOption(overrides?)`     | `FilterOption`         | Default: Sports/category fixture                     |
| `mountFilterOptions(overrides?)`    | `FilterOptions`        | Two default options: Sports + Tech                   |
| `mountSmartSearch(attrs?)`          | `SmartSearch`          | Pass HTML attributes as `Record<string, string>`     |

### Fixtures

```ts
import { defaultResult, defaultFilterData } from "../helpers"
// defaultResult    → { label: "Apple", value: "apple" }
// defaultFilterData → { label: "Sports", value: "sports", field: "category" }
```

### `makeTestComponent(options?)` — for `Component.test.ts`

Creates a unique concrete subclass of `Component` with a fresh tag name for each call. Useful when you need to test lifecycle hooks or shadow mode variants without tag-name collisions.

```ts
import { makeTestComponent } from "../helpers"

const { mount } = makeTestComponent({
  shadowMode: "open",
  renderChild: () => {
    const span = document.createElement("span")
    span.textContent = "hello"
    return span
  },
  spies: {
    onConnect: vi.fn(),
    onDisconnect: vi.fn(),
  },
})

const el = mount()
expect(el.shadowRoot?.querySelector("span")?.textContent).toBe("hello")
el.remove()
```

**Options:**

| Option                | Type                 | Description                                       |
| --------------------- | -------------------- | ------------------------------------------------- |
| `shadowMode`          | `"open" \| "closed"` | Attach a ShadowRoot before connecting             |
| `renderChild`         | `() => HTMLElement`  | Return a child element; omit to use `return this` |
| `spies.onConnect`     | `vi.fn()`            | Called after render in `connectedCallback`        |
| `spies.onDisconnect`  | `vi.fn()`            | Called in `disconnectedCallback`                  |
| `spies.configureAria` | `vi.fn()`            | Called before render in `connectedCallback`       |

The returned element also exposes `el.abortSignal` so you can assert it is/isn't aborted without accessing private fields.

### `makeMixinElement(Mixin)` — for mixin tests

Creates a minimal `HTMLElement` subclass with the mixin applied, registers it under a unique tag, and returns a `mount()` helper.

```ts
import { makeMixinElement } from "../helpers"
import { ActiveMixin } from "@/mixins/ActiveMixin"

const { mount } = makeMixinElement(ActiveMixin)
const el = mount()

el.active = true
expect(el.getAttribute("aria-selected")).toBe("true")

el.active = false
expect(el.getAttribute("aria-selected")).toBe("false")

el.remove()
```

## jsdom limitations

The global `tests/setup.ts` stubs three things that jsdom does not implement:

| Stub                               | Why                                |
| ---------------------------------- | ---------------------------------- |
| `ResizeObserver`                   | Used by Floating UI's `autoUpdate` |
| `Element.prototype.scrollIntoView` | Called after keyboard navigation   |
| `window.scrollX / scrollY`         | Used by positioning utilities      |

Menu positioning (`computePosition` from Floating UI) is called but produces `x: 0, y: 0` in jsdom since there is no real layout engine. Tests that check whether the menu _opens or closes_ work fine; tests that assert specific pixel positions will not be meaningful.
