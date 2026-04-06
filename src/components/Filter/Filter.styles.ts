export const filterOptionsStyles = `
  .ss-filter-options {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--ss-border, #e2e8f0);
  }
`

export const filterOptionStyles = `
  .ss-filter-option {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 999px;
    border: 1px solid var(--ss-border, #e2e8f0);
    background: var(--ss-chip-bg, #f8fafc);
    color: var(--ss-chip-color, #475569);
    font-size: 0.8125rem;
    cursor: pointer;
    user-select: none;
    touch-action: manipulation;
    transition: background 0.1s, color 0.1s, border-color 0.1s;
  }

  .ss-filter-option[active] {
    background: var(--ss-chip-active-bg, #3b82f6);
    border-color: var(--ss-chip-active-bg, #3b82f6);
    color: var(--ss-chip-active-color, #fff);
  }

  .ss-filter-option:hover:not([active]) {
    background: var(--ss-chip-hover-bg, #f1f5f9);
    border-color: var(--ss-chip-hover-border, #cbd5e1);
  }

  [data-keyboard-nav] .ss-filter-option:hover:not([active]) {
    background: var(--ss-chip-bg, #f8fafc);
    border-color: var(--ss-border, #e2e8f0);
  }
`
