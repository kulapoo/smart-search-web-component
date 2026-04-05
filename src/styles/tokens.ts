/**
 * CSS Custom Property tokens for the smart-search component.
 * Applied to `:host` so all child shadow elements inherit them.
 *
 * Host apps can override any token externally:
 *   smart-search { --ss-accent: #7c3aed; }
 */
export const tokens = `
  :host {
    /* Surfaces */
    --ss-bg: #ffffff;
    --ss-border: #e2e8f0;
    --ss-radius: 8px;
    --ss-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04);

    /* Text */
    --ss-text: #1a202c;
    --ss-text-secondary: #718096;
    --ss-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    --ss-font-size: 15px;

    /* Brand accent */
    --ss-accent: #2563eb;
    --ss-accent-ring: rgba(37, 99, 235, 0.2);

    /* States */
    --ss-hover: #e2e8f0;
    --ss-active: #dbeafe;

    /* Chips */
    --ss-chip-bg: #f1f5f9;
    --ss-chip-text: #64748b;

    /* Highlight */
    --ss-mark-bg: #fef9c3;
    --ss-mark-text: inherit;

    /* Input */
    --ss-input-height: 48px;

    /* Transition */
    --ss-transition: 150ms ease;
  }

  :host([theme='dark']) {
    --ss-bg: #1e2433;
    --ss-border: #2d3748;
    --ss-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 10px -5px rgba(0, 0, 0, 0.3);

    --ss-text: #f1f5f9;
    --ss-text-secondary: #94a3b8;

    --ss-accent: #60a5fa;
    --ss-accent-ring: rgba(96, 165, 250, 0.2);

    --ss-hover: #2d3748;
    --ss-active: #1e3a5f;

    --ss-chip-bg: #2d3748;
    --ss-chip-text: #94a3b8;

    --ss-mark-bg: #92400e;
    --ss-mark-text: #fef3c7;
  }
`
