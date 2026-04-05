export const menuStyles = /* css */ `
  ss-menu {
    display: none;
    position: fixed;
    z-index: 1000;
    box-sizing: border-box;
    background: var(--ss-bg, #ffffff);
    border: 1px solid var(--ss-border, #e2e8f0);
    border-radius: var(--ss-radius, 8px);
    box-shadow: var(--ss-shadow, 0 4px 16px rgba(0, 0, 0, 0.12));
    overflow: hidden;
    flex-direction: column;
    font-family: var(--ss-font-family, system-ui, sans-serif);
    font-size: var(--ss-font-size, 15px);
  }

  ss-menu[open] {
    display: flex;
    animation: ss-menu-in var(--ss-transition, 150ms ease);
  }

  ss-menu[open][closing] {
    animation: ss-menu-out var(--ss-transition, 150ms ease) forwards;
  }

  ss-menu[placement="above"] {
    border-radius: var(--ss-radius, 8px) var(--ss-radius, 8px) 4px 4px;
  }

  ss-menu[placement="below"] {
    border-radius: 4px 4px var(--ss-radius, 8px) var(--ss-radius, 8px);
  }

  @keyframes ss-menu-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ss-menu-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-4px);
    }
  }

  ss-menu[placement="above"] {
    animation-name: ss-menu-in-above;
  }

  ss-menu[placement="above"][closing] {
    animation-name: ss-menu-out-above;
  }

  @keyframes ss-menu-in-above {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ss-menu-out-above {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(4px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ss-menu[open],
    ss-menu[open][closing] {
      animation: none;
    }
  }

  .ss-menu-list {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  .ss-menu-empty,
  .ss-menu-loading {
    padding: 12px 16px;
    color: var(--ss-muted, #64748b);
    font-size: var(--ss-font-size, 15px);
    text-align: center;
  }
`

export const menuCustomStyles = (params: { minHeight: number | string }) => /* css */ `
  .ss-result-list {
    padding: 8px;
    min-height: ${typeof params.minHeight === "number" ? `${params.minHeight}px` : params.minHeight};
  }
`
