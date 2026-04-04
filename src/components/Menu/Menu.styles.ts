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
    animation: ss-menu-in var(--ss-transition, 150ms ease);
  }

  ss-menu[open] {
    display: flex;
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

  ss-menu[placement="above"] {
    animation-name: ss-menu-in-above;
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

  .ss-menu-list {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }
`
