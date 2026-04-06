# API Reference

## Attributes

All attributes can be set as HTML attributes or via `setAttribute()`.

| Attribute                   | Type                                        | Default          | Description                                                                         |
| --------------------------- | ------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| `placeholder`               | `string`                                    | `"Search"`       | Input placeholder text                                                              |
| `name`                      | `string`                                    | `"search"`       | Form field name                                                                     |
| `id`                        | `string`                                    | —                | Element ID                                                                          |
| `datasource`                | `string`                                    | `""`             | URL template for data fetching. Use `{{q}}` as the query string placeholder         |
| `debounce`                  | `number`                                    | `300`            | Input debounce delay in milliseconds                                                |
| `clearable`                 | `boolean`                                   | `true`           | Show the clear (×) button when input has a value                                    |
| `disabled`                  | `boolean`                                   | `false`          | Disable the component                                                               |
| `multiselect`               | `boolean`                                   | `false`          | Enable multi-value selection mode                                                   |
| `theme`                     | `"light" \| "dark" \| "auto"`               | `"auto"`         | Color theme. `"auto"` follows system `prefers-color-scheme`                         |
| `filters`                   | `FilterOptionData[]`                        | `[]`             | Filter chip options. Pass as a JSON string                                          |
| `options`                   | `SearchResult[]`                            | `[]`             | Pre-loaded static options for client-side filtering. Pass as a JSON string          |
| `fetch-data-on`             | `"input" \| "focus" \| "input-focus" \| ""` | `"input"`        | When to trigger data fetching                                                       |
| `close-menu-on-blur`        | `boolean`                                   | `false`          | Close the menu when the input loses focus                                           |
| `close-menu-on-select`      | `boolean`                                   | `true`           | Close the menu after a result is selected                                           |
| `open-menu-on-focus`        | `boolean`                                   | `true`           | Open the menu when the input is focused                                             |
| `open-menu-on-input`        | `boolean`                                   | `true`           | Open the menu when the user types                                                   |
| `open-menu-on-load-results` | `boolean`                                   | `true`           | Open the menu automatically when results are loaded                                 |
| `menu-match-width`          | `boolean`                                   | `true`           | Match the menu width to the input width                                             |
| `menu-min-height`           | `number`                                    | `100`            | Minimum menu height in px                                                           |
| `menu-max-height`           | `number`                                    | `360`            | Maximum menu height in px (scrollable beyond this)                                  |
| `menu-offset`               | `number`                                    | `4`              | Gap between the input and the menu in px                                            |
| `menu-placement`            | `string`                                    | `"bottom-start"` | Floating UI placement: `"bottom-start"`, `"bottom-end"`, `"top-start"`, `"top-end"` |
| `close-on-escape`           | `boolean`                                   | `true`           | Close the menu when Escape is pressed                                               |
| `close-on-click-outside`    | `boolean`                                   | `false`          | Close the menu when clicking outside the component                                  |
| `highlight-matches`         | `boolean`                                   | `true`           | Wrap matched substrings in `<mark>` elements. Set to `false` to render plain labels |

## Properties

Set these directly on the element instance after the element has connected.

| Property             | Type                           | Description                                                                                                        |
| -------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `dataAdapter`        | `DataAdapter \| null`          | Custom async data fetching function. Takes priority over `datasource`.                                             |
| `transformResponse`  | `ResponseTransformer`          | Maps raw API JSON to `SearchResults`. Called after every successful fetch via `datasource`.                        |
| `resultItemRenderer` | `ResultItemRendererFn \| null` | Custom result item renderer. Return a `Node` or `string` to replace the default label rendering.                   |
| `highlightMatches`   | `boolean`                      | Get or set whether matched substrings are wrapped in `<mark>` elements. Mirrors the `highlight-matches` attribute. |
| `filterItemRenderer` | `FilterItemRendererFn \| null` | Custom filter chip renderer. Return a `Node` or `string` to replace the default chip label.                        |
| `filterOption`       | `FilterOptionFn \| null`       | Custom filter predicate for client-side filtering of static options.                                               |
| `options`            | `SearchResults`                | Get or set pre-loaded static options programmatically.                                                             |
| `hasOptions`         | `boolean` (read-only)          | Whether any static options are currently loaded.                                                                   |
| `selectedItems`      | `SearchResult[]` (read-only)   | Currently selected items in multiselect mode.                                                                      |

## Methods

| Method             | Signature                                                                                  | Description                                                  |
| ------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `getAttrs`         | `() => SmartSearchAttrs`                                                                   | Returns the current resolved attribute values as an object.  |
| `getInputEl`       | `() => HTMLInputElement`                                                                   | Returns the underlying `<input>` element.                    |
| `getActiveFilters` | `() => Array<{ field: string; value: string }>`                                            | Returns the currently active filter selections.              |
| `setLoading`       | `(loading: boolean) => void`                                                               | Programmatically show or hide the loading state in the menu. |
| `loadResults`      | `(results: SearchResults, query: string) => void`                                          | Programmatically populate the results list without fetching. |
| `loadData`         | `(searchTerm: string, filters?: Array<{ field: string; value: string }>) => Promise<void>` | Programmatically trigger a data fetch.                       |
| `clearCache`       | `() => void`                                                                               | Clear the internal result cache.                             |

## Events

All events bubble and are dispatched on the `<smart-search>` element.

| Event                   | Detail type                                                   | Fired when                                     |
| ----------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| `ss-input-change`       | `{ value: string; sourceEvent: Event }`                       | The user types in the input (debounced)        |
| `ss-input-focus`        | `{ value: string; sourceEvent: Event }`                       | The input receives focus                       |
| `ss-input-blur`         | `{ value: string; sourceEvent: Event }`                       | The input loses focus                          |
| `ss-menu-open`          | —                                                             | The dropdown menu opens                        |
| `ss-menu-close`         | —                                                             | The dropdown menu closes                       |
| `ss-menu-select`        | `{ value: string; result: SearchResult; sourceEvent: Event }` | The user selects a result (single-select mode) |
| `ss-filter-change`      | `{ filters: Array<{ field: string; value: string }> }`        | A filter chip is toggled                       |
| `ss-multiselect-change` | `{ items: SearchResult[]; sourceEvent: Event }`               | Multi-select state changes                     |
| `ss-load-error`         | `{ error: Error; requestQuery: string }`                      | A data fetch fails                             |
| `ss-theme-change`       | `{ theme: string }`                                           | The `theme` attribute changes                  |

Use `SmartSearchEventNames` to reference event name constants:

```js
import { SmartSearchEventNames } from "smart-search-web-component"

el.addEventListener(SmartSearchEventNames.MENU_SELECT, (e) => {
  console.log(e.detail.result)
})
```

## Types

```ts
interface SearchResult<T = Record<string, unknown>> {
  value: string // unique ID
  label: string // display text
  description?: string // secondary text shown below label
  icon?: string // icon URL or CSS class
  group?: string // group heading key
  type?: string // custom type tag
  disabled?: boolean // disables the item
  metadata?: T // arbitrary data payload
}

interface SearchResultGroup<T = Record<string, unknown>> {
  label: string
  icon?: string
  options: SearchResult<T>[]
}

// Results can be a flat array or an array of groups
type SearchResults<T = Record<string, unknown>> = SearchResult<T>[] | SearchResultGroup<T>[]

interface FilterOptionData {
  label: string
  value: string
  field: string
  metadata?: Record<string, unknown>
}

// Receives (requestQuery, signal) — requestQuery is a record like { searchTerm, ...filters }
type DataAdapter<T = Record<string, unknown>> = (
  requestQuery: Record<string, unknown>,
  signal: AbortSignal,
) => Promise<SearchResults<T>> | SearchResults<T>

// Receives (rawJson, requestQueryString) — called after each successful datasource fetch
type ResponseTransformer<T = Record<string, unknown>> = (response: unknown, requestQuery: string) => SearchResults<T>

// Custom result item renderer — return value replaces the default highlighted label
type ResultItemRendererFn<T = Record<string, unknown>> = (result: SearchResult<T>, searchTerm: string) => Node | string

// Custom filter chip renderer
type FilterItemRendererFn = (option: FilterOptionData) => Node | string

// Custom filter predicate for static options
type FilterOptionFn<T = Record<string, unknown>> = (
  option: SearchResult<T>,
  searchTerm: string,
  filters: Array<{ field: string; value: string }>,
) => boolean
```

## `SmartSearchEventNames` Enum

```ts
const SmartSearchEventNames = {
  FILTER_CHANGE: "ss-filter-change",
  INPUT_CHANGE: "ss-input-change",
  INPUT_FOCUS: "ss-input-focus",
  INPUT_BLUR: "ss-input-blur",
  MENU_CLOSE: "ss-menu-close",
  MENU_OPEN: "ss-menu-open",
  MENU_SELECT: "ss-menu-select",
  MULTISELECT_CHANGE: "ss-multiselect-change",
  LOAD_ERROR: "ss-load-error",
  THEME_CHANGE: "ss-theme-change",
}
```
