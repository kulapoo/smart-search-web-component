import { SmartSearch } from "@/SmartSearch"
import { Input } from "@/components/Input/Input"
import { Menu } from "@/components/Menu/Menu"
import { SearchResultList } from "@/components/SearchResult/SearchResultList"
import { SearchResultItem } from "@/components/SearchResult/SearchResultItem"
import { FilterOption } from "@/components/Filter/FilterOption"
import { FilterOptions } from "@/components/Filter/FilterOptions"

customElements.define(Input.tagName, Input)
customElements.define(Menu.tagName, Menu)
customElements.define(SearchResultList.tagName, SearchResultList)
customElements.define(SearchResultItem.tagName, SearchResultItem)
customElements.define(FilterOption.tagName, FilterOption)
customElements.define(FilterOptions.tagName, FilterOptions)
customElements.define("smart-search", SmartSearch)

window.addEventListener("load", () => {
  const smartSearch = document.querySelector("smart-search") as SmartSearch
  smartSearch.loadResults([{ value: "1", label: "Test" }], "test")

  console.log(smartSearch)
  if (smartSearch) {
    smartSearch.addEventListener("ss-menu-open", (e) => {
      console.log("menu open", e)
    })

    smartSearch.addEventListener("ss-input-change", (e) => {
      console.log("input change", (e as CustomEvent<{ value: string; sourceEvent: Event }>).detail)
    })
  }
})
