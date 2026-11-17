(() => {
  globalThis.StreamSleepTimer.uiStyles = `
    :host { color-scheme: dark; font-family: Arial, sans-serif; color: white; font-size: 14px; }
    * { box-sizing: border-box; }
    .panel { text-align: start; }
    h2, .status, .choice span, .test-choice span { min-width: 0; overflow-wrap: anywhere; }
    :host([dir="rtl"]) h2 { letter-spacing: normal; }
    button, input, summary { -webkit-tap-highlight-color: transparent; }
    button { font: inherit; color: inherit; cursor: pointer; }
    .trigger { position: relative; display: grid; place-items: center; width: var(--st-control-size, 4.500rem); height: var(--st-control-size, 4.500rem); border: 0; border-radius: .375rem; padding: var(--st-control-padding, .46875rem); background: transparent; }
    .trigger svg { width: var(--st-icon-size, 3.1875rem); height: var(--st-icon-size, 3.1875rem); transition: transform .15s ease; }
    .trigger:hover svg { transform: scale(1.12); }
    .trigger[data-active="true"]::after { content: ''; position: absolute; bottom: .1875rem; width: .3125rem; height: .3125rem; border-radius: 50%; background: #a8efd0; }
    :focus-visible { outline: 2px solid #a8efd0; outline-offset: 3px; }
    .panel { position: fixed; inset: auto; width: min(300px, calc(100vw - 24px)); max-height: calc(100dvh - 24px); overflow-y: auto; margin: 0; padding: 0; color: #f6f6f6; background: rgba(24,24,27,.97); border: 1px solid #ffffff25; border-radius: 14px; box-shadow: 0 16px 48px #0009; font: 15px/1.4 Arial, sans-serif; }
    .heading { padding: 20px 18px 15px; border-bottom: 1px solid #ffffff15; }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    h2 { margin: 0; font-size: 17px; font-weight: 600; letter-spacing: -.3px; }
    .close { border: 0; background: transparent; border-radius: 4px; font-size: 24px; line-height: 24px; padding: 0 4px; color: #bbb; }
    .status { color: #aaa; font-size: 12px; margin: 9px 0 0; min-height: 17px; font-variant-numeric: tabular-nums; }
    .options { padding: 8px; }
    .choice { display: flex; position: relative; align-items: center; gap: 12px; min-height: 38px; padding: 7px 12px; border-radius: 7px; cursor: pointer; }
    .choice:hover, .test-choice:hover { background: #ffffff12; }
    input { position: absolute; opacity: 0; width: 1px; height: 1px; }
    label:has(input:focus-visible) { outline: 2px solid #a8efd0; outline-offset: -2px; }
    .check { width: 18px; flex-shrink: 0; color: #a8efd0; visibility: hidden; }
    input:checked ~ .check { visibility: visible; }
    .choice:has(input:checked) { background: #ffffff09; }
    .testing { border-top: 1px solid #ffffff15; padding: 12px 18px; }
    summary { color: #aaa; font-size: 12px; cursor: pointer; }
    .test-options { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 12px; }
    .test-choice { position: relative; display: flex; align-items: center; gap: 4px; padding: 7px 8px; border: 1px solid #ffffff20; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .test-choice .check { width: 12px; }
    @media (prefers-reduced-motion: reduce) { .trigger svg { transition: none; } }
  `;
})();
