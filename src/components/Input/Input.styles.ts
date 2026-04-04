export const inputStyles = `
  ss-input {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
  }

  ss-input input {
    width: 100%;
    height: var(--ss-input-height, 48px);
    padding: 0 36px 0 12px;
    border: 1px solid var(--ss-border);
    border-radius: var(--ss-radius);
    background: var(--ss-bg);
    color: var(--ss-text);
    font-family: var(--ss-font-family);
    font-size: var(--ss-font-size);
    outline: none;
    box-sizing: border-box;
    transition: border-color var(--ss-transition);
  }

  ss-input input:focus {
    border-color: var(--ss-accent);
    box-shadow: 0 0 0 3px var(--ss-accent-ring);
  }

  .ss-input-clear {
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--ss-text-secondary);
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--ss-transition), background-color var(--ss-transition);
  }

  .ss-input-clear:hover {
    background: var(--ss-hover);
    color: var(--ss-text);
  }

  ss-input.has-value .ss-input-clear {
    opacity: 1;
    pointer-events: auto;
  }
`
