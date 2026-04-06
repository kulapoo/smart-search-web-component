import "../src/index.ts"
import { SmartSearchEventNames, type SmartSearch } from "@/SmartSearch"
import type { SearchResult } from "@/components/SearchResult/SearchResultItem"
import type { MultiSelectDetail } from "@/utils/events"

interface DummyProduct {
  id: number
  title: string
  description: string
  category: string
  price: number
  thumbnail: string
}

interface DummyResponse {
  products: DummyProduct[]
}

function transformProducts(json: unknown) {
  const { products } = json as DummyResponse
  return products.map((p) => ({
    value: String(p.id),
    label: p.title,
    description: `$${p.price.toFixed(2)} · ${p.category}`,
    group: p.category,
    metadata: { price: p.price, thumbnail: p.thumbnail, category: p.category },
  }))
}

function setupBasic() {
  const el = document.getElementById("demo-basic") as SmartSearch | null
  if (!el) return
  el.transformResponse = transformProducts
}

function setupFilters() {
  const el = document.getElementById("demo-filters") as SmartSearch | null
  if (!el) return
  el.transformResponse = transformProducts
  el.setAttribute(
    "filters",
    JSON.stringify([
      { field: "category", value: "smartphones", label: "Smartphones" },
      { field: "category", value: "laptops", label: "Laptops" },
      { field: "category", value: "beauty", label: "Beauty" },
      { field: "category", value: "fragrances", label: "Fragrances" },
    ]),
  )
}

function setupDark() {
  const el = document.getElementById("demo-dark") as SmartSearch | null
  if (!el) return
  el.transformResponse = transformProducts
}

function setupCustomRenderer() {
  const el = document.getElementById("demo-custom") as SmartSearch | null
  if (!el) return
  el.transformResponse = transformProducts

  el.resultItemRenderer = (result: SearchResult, _searchTerm: string) => {
    const meta = result.metadata as { price: number; thumbnail: string; category: string }

    const card = document.createElement("div")
    card.style.cssText = "display:flex;gap:12px;align-items:center;width:100%;padding:2px 0"

    const img = document.createElement("img")
    img.src = meta.thumbnail
    img.alt = result.label
    img.width = 44
    img.height = 44
    img.style.cssText = "border-radius:6px;object-fit:cover;flex-shrink:0;background:var(--ss-hover)"

    const info = document.createElement("div")
    info.style.cssText = "display:flex;flex-direction:column;gap:2px;min-width:0"

    const name = document.createElement("span")
    name.textContent = result.label
    name.style.cssText = "font-weight:500;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"

    const meta2 = document.createElement("span")
    meta2.style.cssText = "font-size:12px;color:var(--ss-text-secondary);display:flex;gap:8px"

    const price = document.createElement("span")
    price.textContent = `$${meta.price.toFixed(2)}`
    price.style.cssText = "color:var(--ss-accent);font-weight:600"

    const category = document.createElement("span")
    category.textContent = meta.category
    category.style.textTransform = "capitalize"

    meta2.append(price, category)
    info.append(name, meta2)
    card.append(img, info)
    return card
  }
}

function setupMultiSelect() {
  const el = document.getElementById("demo-multiselect") as SmartSearch | null
  const out = document.getElementById("demo-multiselect-selected")
  if (!el || !out) return
  const panel = out

  function renderSelected(items: SearchResult[]) {
    panel.replaceChildren()
    for (const item of items) {
      const line = document.createElement("div")
      line.className = "multiselect-selected-line"
      line.textContent = item.label
      panel.append(line)
    }
  }

  el.addEventListener(SmartSearchEventNames.MULTISELECT_CHANGE, (e) => {
    const { items } = (e as CustomEvent<MultiSelectDetail>).detail
    renderSelected(items)
  })
  el.transformResponse = transformProducts
  renderSelected(el.selectedItems)
}

function setupBrands() {
  const shared = [
    { value: "js", label: "JavaScript", description: "Dynamic web scripting", group: "Frontend" },
    { value: "ts", label: "TypeScript", description: "Typed superset of JS", group: "Frontend" },
    { value: "react", label: "React", description: "UI component library", group: "Frontend" },
    { value: "vue", label: "Vue", description: "Progressive JS framework", group: "Frontend" },
    { value: "go", label: "Go", description: "Compiled systems language", group: "Backend" },
    { value: "rust", label: "Rust", description: "Memory-safe systems lang", group: "Backend" },
    { value: "python", label: "Python", description: "General-purpose language", group: "Backend" },
  ]
  for (const id of ["demo-brand-violet", "demo-brand-emerald", "demo-brand-rose"]) {
    const el = document.getElementById(id) as SmartSearch | null
    if (el) el.options = shared
  }
}

function setupEvents() {
  const el = document.getElementById("demo-events") as SmartSearch | null
  const log = document.getElementById("event-log")
  if (!el || !log) return

  el.transformResponse = transformProducts

  const eventNames = [
    "ss-input-change",
    "ss-menu-select",
    "ss-filter-change",
    "ss-menu-open",
    "ss-menu-close",
    "ss-load-error",
  ]

  for (const name of eventNames) {
    el.addEventListener(name, (e) => {
      const detail = (e as CustomEvent).detail
      const entry = document.createElement("div")
      entry.className = "log-entry"

      const tag = document.createElement("span")
      tag.className = "log-tag"
      tag.textContent = name

      const body = document.createElement("span")
      body.className = "log-body"
      body.textContent = detail ? JSON.stringify(detail).slice(0, 120) : "(no detail)"

      entry.append(tag, body)
      log.prepend(entry)

      // Keep log trimmed to 8 entries
      while (log.children.length > 8) {
        log.removeChild(log.lastChild!)
      }
    })
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

window.addEventListener("load", () => {
  setupBasic()
  setupFilters()
  setupDark()
  setupBrands()
  setupCustomRenderer()
  setupMultiSelect()
  setupEvents()
})
