import type { SmartSearchAttrs } from "@/SmartSearchConstants";

export interface WithLoadData {
    loadData(searchTerm: string, filters: Array<{ field: string; value: string }>): Promise<void>
  }
  
  export interface WithGetAttrs {
    getAttrs(): SmartSearchAttrs
  }

  export interface WithInputEl {
    getInputEl(): HTMLInputElement
  }
  
  export interface WithActiveFilters {
    getActiveFilters(): Array<{ field: string; value: string }>
  }