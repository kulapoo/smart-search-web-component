# smart-search-web-component

A lightweight, framework-agnostic smart search input built on Web Components. Drop it into any HTML page, React app, Vue project, or plain static site — no framework required.

[![CI](https://github.com/kulapoo/smart-search-web-component/actions/workflows/ci.yml/badge.svg)](https://github.com/kulapoo/smart-search-web-component/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[**Live Demo**](https://kulapoo.github.io/smart-search-web-component/) · [Getting Started](docs/getting-started.md) · [API Reference](docs/api-reference.md) · [Theming](docs/theming.md) · [Advanced Usage](docs/advanced-usage.md)

---

## Why smart-search?

- **~11 kB gzipped** — lighter than most framework-specific alternatives
- **Zero framework lock-in** — works with React, Vue, Svelte, Angular, or plain HTML
- **Production-ready** — keyboard navigation, ARIA live regions, dark mode, form integration
- **Customizable** — 25+ CSS tokens, custom result renderers, pluggable data adapters

## Features

- **Flexible data sources** — URL template with `{{q}}` placeholder, custom async adapter, or pre-loaded static options
- **Filter chips** — built-in toggleable filters that compose query params with the search term
- **Keyboard navigation** — arrow keys, Enter, Escape, Home/End with ARIA live regions
- **Grouped results** — flat or grouped result lists via the `group` field
- **Custom renderers** — override how results and filter chips are rendered with plain DOM
- **Multi-select** — optional multi-value selection with chip display
- **Theming** — 25+ CSS custom properties, built-in dark mode, `theme="auto"` respects system preference
- **Form integration** — works with native `<form>`, supports `name` attribute
- **Result caching** — automatic query-level cache to avoid redundant network requests

### Peer Dependencies

This library requires two peer dependencies:

| Package                                        | Purpose              | Size           |
| ---------------------------------------------- | -------------------- | -------------- |
| [`@floating-ui/dom`](https://floating-ui.com/) | Dropdown positioning | ~3 kB gzip     |
| [`lucide`](https://lucide.dev/)                | Search/clear icons   | Tree-shakeable |

## Quick Start

### Remote data source

```html
<smart-search
  placeholder="Search products..."
  datasource="https://api.example.com/search?{{q}}"
  debounce="300"
></smart-search>

<script type="module">
  import "smart-search-web-component"

  const el = document.querySelector("smart-search")

  // Map your API response to SearchResult[]
  el.transformResponse = (json) =>
    json.items.map((item) => ({
      value: item.id,
      label: item.name,
      description: item.category,
      group: item.type,
    }))

  el.addEventListener("ss-menu-select", (e) => {
    console.log("Selected:", e.detail.result)
  })
</script>
```

The `{{q}}` placeholder is replaced with the composed query string (e.g. `q=term&category=laptops`).

### Static options (no network)

```html
<smart-search
  placeholder="Search languages..."
  options='[
    {"value":"js","label":"JavaScript","description":"Web scripting","group":"Frontend"},
    {"value":"go","label":"Go","description":"Systems language","group":"Backend"}
  ]'
></smart-search>
```

### With filters

```html
<smart-search
  datasource="https://api.example.com/search?{{q}}"
  filters='[
    {"field":"category","value":"smartphones","label":"Smartphones"},
    {"field":"category","value":"laptops","label":"Laptops"}
  ]'
></smart-search>
```

### Multi-select

```html
<smart-search multiselect close-menu-on-select="false" datasource="https://api.example.com/search?{{q}}"></smart-search>
```

### Dark mode

```html
<!-- Explicit dark -->
<smart-search theme="dark" datasource="..."></smart-search>

<!-- Follow system preference (default) -->
<smart-search theme="auto" datasource="..."></smart-search>
```

### Custom result renderer

```js
el.resultItemRenderer = (result) => {
  const card = document.createElement("div")
  card.style.cssText = "display:flex;gap:12px;align-items:center"

  const img = document.createElement("img")
  img.src = result.metadata.thumbnail
  img.width = 44
  img.height = 44

  const info = document.createElement("div")
  info.innerHTML = `
    <strong>${result.label}</strong>
    <div style="color:var(--ss-accent)">$${result.metadata.price}</div>
  `

  card.append(img, info)
  return card
}
```

## Theming

Override any CSS custom property on the element:

```css
smart-search {
  --ss-accent: #7c3aed;
  --ss-radius: 6px;
  --ss-input-height: 44px;
  --ss-bg: #faf5ff;
  --ss-font-family: "Inter", sans-serif;
}
```

See [Theming docs](docs/theming.md) for the full list of 25+ tokens.

## Events

| Event                   | Detail                           | Fires when                 |
| ----------------------- | -------------------------------- | -------------------------- |
| `ss-input-change`       | `{ value, sourceEvent }`         | User types in the input    |
| `ss-input-focus`        | `{ value, sourceEvent }`         | Input receives focus       |
| `ss-input-blur`         | `{ value, sourceEvent }`         | Input loses focus          |
| `ss-menu-select`        | `{ value, result, sourceEvent }` | A result is selected       |
| `ss-filter-change`      | `{ filters }`                    | Filter chips are toggled   |
| `ss-multiselect-change` | `{ items, sourceEvent }`         | Multi-select state changes |
| `ss-menu-open`          | —                                | Dropdown opens             |
| `ss-menu-close`         | —                                | Dropdown closes            |
| `ss-load-error`         | `{ error, requestQuery }`        | Data fetch fails           |
| `ss-theme-change`       | `{ theme }`                      | Theme attribute changes    |

## Bundle Size

| Format    | Raw     | Gzipped |
| --------- | ------- | ------- |
| ES Module | 42.9 kB | 11.5 kB |
| UMD       | 35.6 kB | 10.3 kB |

## Documentation

| Guide                                      | Description                                                 |
| ------------------------------------------ | ----------------------------------------------------------- |
| [Getting Started](docs/getting-started.md) | Installation, setup, and your first search component        |
| [API Reference](docs/api-reference.md)     | All attributes, properties, methods, events, and types      |
| [Theming](docs/theming.md)                 | CSS custom properties, dark mode, and custom themes         |
| [Advanced Usage](docs/advanced-usage.md)   | Custom renderers, data adapters, form integration, and more |
| [Testing](docs/testing.md)                 | Running tests, test harness, writing new tests              |

## Browser Support

Requires native Custom Elements v1 and Shadow DOM v1:

| Chrome | Firefox | Safari | Edge |
| ------ | ------- | ------ | ---- |
| 67+    | 63+     | 12.1+  | 79+  |

## License

MIT
