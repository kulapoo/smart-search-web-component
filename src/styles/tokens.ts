/**
 * CSS Custom Property tokens for the smart-search component.
 * Applied to `:host` so all child shadow elements inherit them.
 *
 * Host apps can override any token externally:
 *   smart-search { --ss-accent: #7c3aed; }
 *
 * Custom themes:
 *   smart-search[theme="brand"] { --ss-accent: #7c3aed; --ss-bg: #faf5ff; }
 */

const darkTokens = `
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
    --ss-chip-color: #94a3b8;
    --ss-chip-hover-bg: #374151;
    --ss-chip-hover-border: #4b5563;

    --ss-mark-bg: #92400e;
    --ss-mark-text: #fef3c7;

    --ss-muted: #94a3b8;
`

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
    --ss-chip-color: #475569;
    --ss-chip-active-bg: #3b82f6;
    --ss-chip-active-color: #ffffff;
    --ss-chip-hover-bg: #f1f5f9;
    --ss-chip-hover-border: #cbd5e1;

    /* Highlight */
    --ss-mark-bg: #fef9c3;
    --ss-mark-text: inherit;

    /* Muted text */
    --ss-muted: #64748b;

    /* Input */
    --ss-input-height: 48px;

    /* Transition */
    --ss-transition: 150ms ease;

    /* Result list layout */
    --ss-result-list-padding: 4px;
    --ss-result-padding: 8px 12px;
    --ss-result-radius: calc(var(--ss-radius, 8px) - 4px);
    --ss-result-disabled-opacity: 0.45;

    /* Group labels */
    --ss-group-label-padding: 8px 12px 4px;
    --ss-group-label-font-size: 11px;
    --ss-group-label-font-weight: 600;
  }

  :host([theme='dark']) {
    ${darkTokens}
  }

  @media (prefers-color-scheme: dark) {
    :host(:not([theme='light']):not([theme='dark'])) {
      ${darkTokens}
    }
  }
`
