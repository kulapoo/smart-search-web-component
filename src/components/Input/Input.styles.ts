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
    cursor: pointer;
    touch-action: manipulation;
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

  ss-input.has-chips {
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 6px 36px 6px 8px;
    border: 1px solid var(--ss-border);
    border-radius: var(--ss-radius);
    background: var(--ss-bg);
    min-height: var(--ss-input-height, 48px);
    box-sizing: border-box;
    cursor: text;
    transition: border-color var(--ss-transition), box-shadow var(--ss-transition);
  }

  ss-input.has-chips:focus-within {
    border-color: var(--ss-accent);
    box-shadow: 0 0 0 3px var(--ss-accent-ring);
  }

  ss-input.has-chips input {
    border: none;
    background: transparent;
    box-shadow: none;
    height: auto;
    min-height: 32px;
    flex: 1;
    min-width: 60px;
    width: auto;
    padding: 0 4px;
  }

  ss-input.has-chips input:focus {
    border-color: transparent;
    box-shadow: none;
  }

  .ss-input-chips {
    display: contents;
  }

  .ss-input-chips:empty {
    display: none;
  }

  .ss-input-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px 2px 8px;
    background: var(--ss-chip-active-bg, #3b82f6);
    color: var(--ss-chip-active-color, #fff);
    border-radius: 999px;
    font-size: var(--ss-font-size);
    line-height: 1.4;
    white-space: nowrap;
    max-width: 200px;
  }

  .ss-input-chip-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ss-input-chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    color: inherit;
    cursor: pointer;
    touch-action: manipulation;
    flex-shrink: 0;
    transition: background-color var(--ss-transition);
  }

  .ss-input-chip-remove:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`
