import { SmartSearch, SmartSearchEventNames } from "@/SmartSearch"
import { Input } from "@/components/Input/Input"
import { Menu } from "@/components/Menu/Menu"
import { SearchResultList } from "@/components/SearchResult/SearchResultList"
import { SearchResultItem, type SearchResult } from "@/components/SearchResult/SearchResultItem"
import { FilterOption, type FilterOptionData } from "@/components/Filter/FilterOption"
import { FilterOptions } from "@/components/Filter/FilterOptions"
import type { FilterItemRendererFn } from "@/types/datasource"

export type { FilterOptionData, FilterItemRendererFn }

customElements.define(Input.tagName, Input)
customElements.define(Menu.tagName, Menu)
customElements.define(SearchResultList.tagName, SearchResultList)
customElements.define(SearchResultItem.tagName, SearchResultItem)
customElements.define(FilterOption.tagName, FilterOption)
customElements.define(FilterOptions.tagName, FilterOptions)
customElements.define(SmartSearch.tagName, SmartSearch)

interface DummyJsonProduct {
  id: number
  title: string
  description: string
  category: string
  price: number
}

interface DummyJsonResponse {
  products: DummyJsonProduct[]
}

window.addEventListener("load", () => {
  const smartSearch = document.querySelector(SmartSearch.tagName) as SmartSearch
  if (!smartSearch) return

  // Response: { products: [{ id, title, description, category, price }] }
  smartSearch.transformResponse = (json: unknown) => {
    const { products } = json as DummyJsonResponse
    return products.map((p) => ({
      value: String(p.id),
      label: p.title,
      description: `$${p.price} · ${p.category}`,
      // group: p.category,
      metadata: { price: p.price, description: p.description },
    }))
  }

  // smartSearch.dataAdapter = (requestQuery: Record<string, unknown>) => {
  //   const {

  //   } = requestQuery

  //   return fetch(`https://dummyjson.com/products/search?${requestQuery}`)
  //     .then((response) => response.json())
  //     .then((json) => {
  //       const { products } = json as DummyJsonResponse
  //       return products
  //     })
  // }

  smartSearch.addEventListener("ss-input-change", (e) => {
    console.log("input change", (e as CustomEvent<{ value: string; sourceEvent: Event }>).detail)
  })

  smartSearch.addEventListener("ss-menu-select", (e) => {
    console.log("selected", (e as CustomEvent).detail)
  })

  smartSearch.addEventListener("ss-load-error", (e) => {
    console.error("load error", (e as CustomEvent).detail)
  })

  smartSearch.addEventListener(SmartSearchEventNames.MENU_SELECT, (e) => {
    console.log("menu select", (e as CustomEvent<{ value: string; result: SearchResult; sourceEvent: Event }>).detail)
  })
})
