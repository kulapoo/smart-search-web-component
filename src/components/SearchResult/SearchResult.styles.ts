export const searchResultListStyles =  `
  ss-search-result-list {
    display: block;
    padding: var(--ss-result-list-padding, 4px);
    margin: 0;
  }


  .ss-result-group {
    display: block;
  }

  .ss-result-group-label {
    padding: var(--ss-group-label-padding, 8px 12px 4px);
    font-size: var(--ss-group-label-font-size, 11px);
    font-weight: var(--ss-group-label-font-weight, 600);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ss-text-secondary);
    user-select: none;
  }

  .ss-result-group + .ss-result-group-label {
    margin-top: 4px;
    border-top: 1px solid var(--ss-border);
    padding-top: 12px;
  }
`

export const searchResultItemStyles = `
  ss-search-result-item {
    display: flex;
    align-items: center;
    gap: var(--ss-result-gap, 8px);
    padding: var(--ss-result-padding, 8px 12px);
    border-radius: var(--ss-result-radius, calc(var(--ss-radius, 8px) - 4px));
    color: var(--ss-text);
    font-family: var(--ss-font-family);
    font-size: var(--ss-font-size);
    line-height: 1.4;
    cursor: pointer;
    user-select: none;
    transition:
      background-color var(--ss-transition),
      color var(--ss-transition);
  }


  ss-search-result-item:hover:not([disabled]) {
    background: var(--ss-hover);
  }


  ss-search-result-item[active] {
    background: var(--ss-active);
    color: var(--ss-text);
    outline: none;
  }


  ss-search-result-item[disabled] {
    opacity: var(--ss-result-disabled-opacity, 0.45);
    cursor: not-allowed;
    pointer-events: none;
  }


  ss-search-result-item:focus-visible {
    outline: 2px solid var(--ss-accent);
    outline-offset: -2px;
  }


  ss-search-result-item mark.ss-highlight {
    background: var(--ss-mark-bg);
    color: var(--ss-mark-text);
    border-radius: 2px;
    padding: 0 1px;
  }


  @media (prefers-reduced-motion: reduce) {
    ss-search-result-item {
      transition: none;
    }
  }
`
