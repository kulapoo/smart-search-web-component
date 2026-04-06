# Getting Started

## Installation

```html
<script type="module" src="https://unpkg.com/@floating-ui/dom"></script>
<script type="module" src="https://unpkg.com/lucide"></script>
<script type="module" src="https://unpkg.com/smart-search-web-component"></script>
```

## Minimal Example

```html
<!doctype html>
<html>
  <head>
    <script type="module" src="https://unpkg.com/@floating-ui/dom"></script>
    <script type="module" src="https://unpkg.com/lucide"></script>
    <script type="module" src="https://unpkg.com/smart-search-web-component"></script>
  </head>
  <body>
    <smart-search placeholder="Search..." datasource="https://api.example.com/search?{{q}}"></smart-search>

    <script type="module">
      const el = document.querySelector("smart-search")

      // Map API response to SearchResult[]
      el.transformResponse = (json) => json.results.map((r) => ({ value: r.id, label: r.name }))

      el.addEventListener("ss-menu-select", (e) => {
        console.log("selected:", e.detail.value, e.detail.result)
      })
    </script>
  </body>
</html>
```

## Datasource URL

The `datasource` attribute accepts a URL template. Use `{{q}}` as a placeholder — it is replaced with the composed query string (`q=searchTerm&field=value`).

```html
<!-- {{q}} is replaced: ?q=phone&category=smartphones -->
<smart-search datasource="https://api.example.com/search?{{q}}"></smart-search>
```

If `{{q}}` is absent, the query string is appended automatically:

```html
<!-- Becomes: https://api.example.com/search?q=phone -->
<smart-search datasource="https://api.example.com/search"></smart-search>
```

## Transforming the Response

`transformResponse` maps your API's raw JSON to `SearchResult[]`. It is called after every successful fetch.

```js
const el = document.querySelector("smart-search")

el.transformResponse = (json) => {
  return json.hits.map((hit) => ({
    value: hit.objectID, // required: unique string ID
    label: hit.name, // required: display text
    description: hit.category, // optional: secondary/subtitle text
    group: hit.type, // optional: groups results under a heading
    icon: hit.imageUrl, // optional: icon URL or CSS class
    disabled: hit.archived, // optional: disables the item
    metadata: { price: hit.price }, // optional: arbitrary payload
  }))
}
```

`transformResponse` receives two arguments: `(json: unknown, requestQuery: string) => SearchResults`.

## Pre-loaded Static Options

For client-side filtering with no server:

```html
<smart-search
  options='[
    {"value":"js","label":"JavaScript","description":"Web scripting","group":"Frontend"},
    {"value":"ts","label":"TypeScript","description":"Typed superset of JS","group":"Frontend"},
    {"value":"go","label":"Go","description":"Systems language","group":"Backend"}
  ]'
></smart-search>
```

The component filters by `label` and `description` as the user types. See [Advanced Usage → filterOption](advanced-usage.md#filteroption) for custom filter logic.

## Adding Filters

The `filters` attribute adds filter chips above the results:

```html
<smart-search
  datasource="https://api.example.com/search?{{q}}"
  filters='[
    {"field":"type","value":"article","label":"Articles"},
    {"field":"type","value":"video","label":"Videos"},
    {"field":"type","value":"podcast","label":"Podcasts"}
  ]'
></smart-search>
```

When a filter chip is toggled, the active filter's `field=value` pair is appended to the query: `q=term&type=article`. Your server receives and can handle the filter params.

## Listening to Events

```js
el.addEventListener("ss-input-change", (e) => {
  console.log("typed:", e.detail.value)
})

el.addEventListener("ss-menu-select", (e) => {
  const { value, result } = e.detail
  console.log("selected id:", value, "result:", result)
})

el.addEventListener("ss-filter-change", (e) => {
  console.log("active filters:", e.detail.filters)
  // [{ field: 'type', value: 'article' }]
})
```

See [API Reference → Events](api-reference.md#events) for the full list with detail shapes.
