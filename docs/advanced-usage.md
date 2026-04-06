# Advanced Usage

## DataAdapter

Use a `dataAdapter` function when you need full control over data fetching — for custom auth headers, GraphQL, or non-REST APIs. A `dataAdapter` takes priority over the `datasource` attribute.

```js
const el = document.querySelector("smart-search")

el.dataAdapter = async (requestQuery, signal) => {
  // requestQuery is an object: { searchTerm: 'laptop', category: 'electronics' }
  const res = await fetch("/api/search", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(requestQuery),
  })
  const json = await res.json()
  return json.results.map((r) => ({
    value: r.id,
    label: r.title,
    description: r.subtitle,
  }))
}
```

The `signal` argument is an `AbortSignal` — the component aborts in-flight requests when a new one starts (e.g. when the user types faster than the debounce allows). Pass it to `fetch` to avoid processing stale responses.

## Disabling Highlight

By default, matching substrings in result labels are wrapped in `<mark class="ss-highlight">` elements and styled via `--ss-mark-bg` / `--ss-mark-text`. Set `highlight-matches="false"` to render plain labels instead:

```html
<smart-search highlight-matches="false" datasource="..."></smart-search>
```

Or toggle it at runtime via the property:

```js
el.highlightMatches = false
```

This has no effect when a `resultItemRenderer` is set — the custom renderer is always responsible for its own output.

## Custom Result Renderer

`resultItemRenderer` replaces the default highlighted-label rendering for each result item. Return a `Node` or a `string`.

```js
el.resultItemRenderer = (result, searchTerm) => {
  const card = document.createElement("div")
  card.style.cssText = "display:flex;gap:10px;align-items:center;padding:2px 0"

  const img = document.createElement("img")
  img.src = result.metadata.thumbnail
  img.width = 40
  img.height = 40
  img.style.cssText = "border-radius:6px;object-fit:cover;flex-shrink:0"

  const info = document.createElement("div")
  info.innerHTML = `
    <div style="font-weight:500">${result.label}</div>
    <div style="font-size:13px;color:var(--ss-text-secondary)">${result.description ?? ""}</div>
  `

  card.append(img, info)
  return card
}
```

Use CSS custom properties like `var(--ss-text-secondary)` inside your rendered nodes — they are available because the node lives inside the component's shadow DOM, which inherits `:host` tokens.

## Custom Filter Renderer

`filterItemRenderer` replaces the default chip label rendering.

```js
el.filterItemRenderer = (option) => {
  const chip = document.createElement("span")
  chip.style.cssText = "display:flex;align-items:center;gap:4px"
  chip.innerHTML = `<span class="icon-${option.field}"></span>${option.label}`
  return chip
}
```

## Custom Filter Predicate (`filterOption`)

For static options (`options` attribute/property), the default filter matches `label` and `description` against the search term and checks `metadata` fields against active filter values. Replace this logic entirely with `filterOption`:

```js
el.options = myItems

el.filterOption = (option, searchTerm, activeFilters) => {
  // Custom fuzzy match on label
  const term = searchTerm.toLowerCase()
  const matchesTerm = !term || option.label.toLowerCase().includes(term)

  // Custom filter logic
  const matchesFilters = activeFilters.every(({ field, value }) => option.metadata?.[field] === value)

  return matchesTerm && matchesFilters
}
```

## Grouped Results

Set the `group` field on `SearchResult` to group results under headings. Groups are assembled automatically.

```js
el.transformResponse = (json) =>
  json.items.map((item) => ({
    value: item.id,
    label: item.name,
    group: item.category, // items with the same group value are grouped together
  }))
```

Alternatively, return `SearchResultGroup[]` directly:

```js
el.transformResponse = (json) => [
  {
    label: "Recent",
    options: json.recent.map((r) => ({ value: r.id, label: r.name })),
  },
  {
    label: "Suggested",
    options: json.suggested.map((r) => ({ value: r.id, label: r.name })),
  },
]
```

## Programmatic Control

### Manually load results

```js
el.setLoading(true)

const results = await myAsyncFn(query)
el.loadResults(results, query)
```

### Trigger a fetch

```js
el.loadData("search term", [{ field: "category", value: "electronics" }])
```

### Clear cache

The component caches results per query string. Clear it when your data changes:

```js
el.clearCache()
```

Clearing is done automatically when the `datasource` attribute changes.

## Multi-select Mode

Enable with `multiselect` attribute:

```html
<smart-search multiselect datasource="..."></smart-search>
```

Selected items are displayed as chips in the input. Listen to state changes:

```js
el.addEventListener("ss-multiselect-change", (e) => {
  console.log("selected items:", e.detail.items)
})

// Read programmatically
console.log(el.selectedItems)
```

## Form Integration

The component participates in native `<form>` submission via the Form-Associated Custom Elements API.

```html
<form id="search-form">
  <smart-search name="query" datasource="..."></smart-search>
  <button type="submit">Search</button>
</form>
```

The `name` attribute controls the form field name. The input value is submitted with the form.

## Accessing the Input Element

Use `getInputEl()` to access the underlying `<input>` for programmatic focus or value manipulation:

```js
// Focus on page load
window.addEventListener("load", () => {
  el.getInputEl().focus()
})

// Read current value
const currentQuery = el.getInputEl().value
```

## Handling Load Errors

```js
el.addEventListener("ss-load-error", (e) => {
  const { error, requestQuery } = e.detail
  console.error("Search failed for query:", requestQuery, error)
  // Show your own error UI
})
```

## Pre-fetching on Focus

Set `fetch-data-on="focus"` to load results as soon as the input is focused (useful for recent searches or pre-populated lists):

```html
<smart-search fetch-data-on="focus" datasource="..."></smart-search>
```

Options: `"input"` (default), `"focus"`, `"input-focus"` (both), `""` (manual only).
