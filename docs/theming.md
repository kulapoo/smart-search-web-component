# Theming

`<smart-search>` exposes CSS custom properties at the `:host` scope. Override any token from outside the component:

```css
smart-search {
  --ss-accent: #7c3aed;
  --ss-radius: 4px;
}
```

## Token Reference

| Token                          | Light default                                                      | Dark default                                                      | Description                               |
| ------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------- |
| **Surfaces**                   |                                                                    |                                                                   |                                           |
| `--ss-bg`                      | `#ffffff`                                                          | `#1e2433`                                                         | Surface / menu background                 |
| `--ss-border`                  | `#e2e8f0`                                                          | `#2d3748`                                                         | Input and menu border color               |
| `--ss-radius`                  | `8px`                                                              | `8px`                                                             | Border radius for input and menu          |
| `--ss-shadow`                  | `0 10px 25px -5px rgba(0,0,0,.1), 0 4px 10px -5px rgba(0,0,0,.04)` | `0 10px 25px -5px rgba(0,0,0,.5), 0 4px 10px -5px rgba(0,0,0,.3)` | Box shadow on the menu panel              |
| **Text**                       |                                                                    |                                                                   |                                           |
| `--ss-text`                    | `#1a202c`                                                          | `#f1f5f9`                                                         | Primary text color                        |
| `--ss-text-secondary`          | `#718096`                                                          | `#94a3b8`                                                         | Secondary / description text              |
| `--ss-muted`                   | `#64748b`                                                          | `#94a3b8`                                                         | Muted text color                          |
| `--ss-font-family`             | system-ui stack                                                    | system-ui stack                                                   | Font stack                                |
| `--ss-font-size`               | `15px`                                                             | `15px`                                                            | Base font size                            |
| **Accent**                     |                                                                    |                                                                   |                                           |
| `--ss-accent`                  | `#2563eb`                                                          | `#60a5fa`                                                         | Focus ring, active highlight, accent      |
| `--ss-accent-ring`             | `rgba(37,99,235,.2)`                                               | `rgba(96,165,250,.2)`                                             | Focus ring glow color                     |
| **States**                     |                                                                    |                                                                   |                                           |
| `--ss-hover`                   | `#e2e8f0`                                                          | `#2d3748`                                                         | Item hover background                     |
| `--ss-active`                  | `#dbeafe`                                                          | `#1e3a5f`                                                         | Active / keyboard-focused item background |
| **Chips**                      |                                                                    |                                                                   |                                           |
| `--ss-chip-bg`                 | `#f1f5f9`                                                          | `#2d3748`                                                         | Filter chip background                    |
| `--ss-chip-text`               | `#64748b`                                                          | `#94a3b8`                                                         | Filter chip text                          |
| `--ss-chip-color`              | `#475569`                                                          | `#94a3b8`                                                         | Filter chip foreground color              |
| `--ss-chip-active-bg`          | `#3b82f6`                                                          | —                                                                 | Active chip background                    |
| `--ss-chip-active-color`       | `#ffffff`                                                          | —                                                                 | Active chip text color                    |
| `--ss-chip-hover-bg`           | `#f1f5f9`                                                          | `#374151`                                                         | Chip hover background                     |
| `--ss-chip-hover-border`       | `#cbd5e1`                                                          | `#4b5563`                                                         | Chip hover border color                   |
| **Highlight**                  |                                                                    |                                                                   |                                           |
| `--ss-mark-bg`                 | `#fef9c3`                                                          | `#92400e`                                                         | Search term highlight background          |
| `--ss-mark-text`               | `inherit`                                                          | `#fef3c7`                                                         | Search term highlight text                |
| **Input**                      |                                                                    |                                                                   |                                           |
| `--ss-input-height`            | `48px`                                                             | `48px`                                                            | Height of the search input                |
| `--ss-transition`              | `150ms ease`                                                       | `150ms ease`                                                      | Animation duration and easing             |
| **Results**                    |                                                                    |                                                                   |                                           |
| `--ss-result-list-padding`     | `4px`                                                              | `4px`                                                             | Padding around the result list            |
| `--ss-result-padding`          | `8px 12px`                                                         | `8px 12px`                                                        | Padding inside each result item           |
| `--ss-result-radius`           | `calc(var(--ss-radius) - 4px)`                                     | `calc(var(--ss-radius) - 4px)`                                    | Border radius for result items            |
| `--ss-result-disabled-opacity` | `0.45`                                                             | `0.45`                                                            | Opacity for disabled result items         |
| **Group labels**               |                                                                    |                                                                   |                                           |
| `--ss-group-label-padding`     | `8px 12px 4px`                                                     | `8px 12px 4px`                                                    | Padding around group headings             |
| `--ss-group-label-font-size`   | `11px`                                                             | `11px`                                                            | Group heading font size                   |
| `--ss-group-label-font-weight` | `600`                                                              | `600`                                                             | Group heading font weight                 |

## Dark Mode

Set `theme="dark"` on the element:

```html
<smart-search theme="dark" datasource="..."></smart-search>
```

Toggle from JavaScript:

```js
const el = document.querySelector("smart-search")
el.setAttribute("theme", window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
```

`theme="auto"` (the default) uses `@media (prefers-color-scheme: dark)` inside the shadow DOM automatically.

## Custom Theme Examples

### Purple accent

```css
smart-search {
  --ss-accent: #7c3aed;
  --ss-accent-ring: rgba(124, 58, 237, 0.2);
  --ss-active: #ede9fe;
}
```

### Compact size

```css
smart-search {
  --ss-input-height: 40px;
  --ss-font-size: 14px;
  --ss-radius: 6px;
}
```

### Full custom (dark brand)

```css
smart-search {
  --ss-bg: #0f172a;
  --ss-border: #334155;
  --ss-text: #e2e8f0;
  --ss-text-secondary: #94a3b8;
  --ss-accent: #38bdf8;
  --ss-accent-ring: rgba(56, 189, 248, 0.2);
  --ss-hover: #1e293b;
  --ss-active: #0f3a52;
  --ss-chip-bg: #1e293b;
  --ss-chip-text: #94a3b8;
  --ss-input-height: 44px;
  --ss-radius: 10px;
}
```

## Scoping Multiple Instances

Each `<smart-search>` element is independently themeable:

```css
#global-search {
  --ss-accent: #2563eb;
  --ss-input-height: 52px;
}

#sidebar-search {
  --ss-accent: #059669;
  --ss-input-height: 40px;
  --ss-font-size: 14px;
}
```
