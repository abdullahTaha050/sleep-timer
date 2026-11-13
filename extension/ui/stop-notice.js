(() => {
  const { t, language, direction } = globalThis.StreamSleepTimer.i18n;
  class StopNotice {
    constructor({ onContinue, onCancel }) {
      this.host = document.createElement('span');
      this.host.dataset.sleepTimerNotice = '';
      this.host.lang = language;
      this.host.dir = direction;
      const shadow = this.host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          :host { color-scheme: light dark; }
          * { box-sizing: border-box; }
          .notice {
            --surface: #fafafc;
            --text: #1d1d1f;
            --muted-surface: #ededf0;
            --secondary-hover: #e2e2e7;
            --border: #0000000d;
            --accent: #0071e3;
            --accent-hover: #0066cc;
            --focus: #0071e3;
            position: fixed; inset: auto; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: min(340px, calc(100vw - 32px));
            max-height: calc(100dvh - 32px); overflow-y: auto;
            margin: 0; padding: 12px;
            border: 1px solid var(--border); border-radius: 18px;
            background: var(--surface); color: var(--text); text-align: start;
            font: 16px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            box-shadow: 0 12px 32px #0000001a, 0 2px 6px #00000008;
          }
          .summary { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
          .symbol { display: grid; place-items: center; flex: 0 0 32px; height: 32px; border-radius: 50%; background: var(--muted-surface); }
          .symbol svg { width: 18px; height: 18px; }
          p { margin: 0; font-size: 18px; line-height: 1.3; font-weight: 600; letter-spacing: -.3px; overflow-wrap: anywhere; }
          :host([dir="rtl"]) p { letter-spacing: normal; }
          .actions { display: flex; flex-wrap: wrap; gap: 8px; direction: ltr; }
          button {
            flex: 1 1 auto; min-width: 0; min-height: 44px; max-width: 100%;
            direction: ${direction}; overflow-wrap: anywhere;
            border: 0; border-radius: 12px; padding: 10px 12px;
            background: var(--muted-surface); color: var(--text);
            font: inherit; font-size: 14px; line-height: 1.4; font-weight: 500;
            cursor: pointer; -webkit-tap-highlight-color: transparent;
            transition: background-color .16s ease;
          }
          .continue { background: var(--accent); color: #fff; }
          @media (hover: hover) {
            .continue:hover { background: var(--accent-hover); }
            .cancel:hover { background: var(--secondary-hover); }
          }
          button:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
          @media (prefers-color-scheme: dark) {
            .notice {
              --surface: #1d1d1f;
              --text: #f5f5f7;
              --muted-surface: #303033;
              --secondary-hover: #3d3d40;
              --border: #ffffff14;
              --focus: #68b5ff;
              box-shadow: 0 12px 32px #0005, 0 2px 6px #0002;
            }
          }
          @media (max-width: 359px) {
            .notice { padding: 10px; }
            .actions { flex-direction: column; }
          }
          @media (prefers-reduced-motion: reduce) { button { transition: none; } }
          @media (forced-colors: active) { .notice, button { border: 1px solid CanvasText; } }
        </style>
        <section class="notice" popover="manual" aria-label="${t('timerName')}">
          <div class="summary">
            <span class="symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 13.1A8.5 8.5 0 0 1 10.9 3.5 8.5 8.5 0 1 0 20.5 13.1Z"/></svg></span>
            <p role="status" aria-live="polite" aria-atomic="true"></p>
          </div>
          <div class="actions"><button class="continue" type="button">${t('continuePlayback')}</button><button class="cancel" type="button">${t('turnOffTimer')}</button></div>
        </section>`;
      this.panel = shadow.querySelector('.notice');
      this.message = shadow.querySelector('p');
      this.continueButton = shadow.querySelector('.continue');
      this.continueButton.addEventListener('click', onContinue);
      shadow.querySelector('.cancel').addEventListener('click', onCancel);
      for (const name of ['click', 'dblclick', 'pointerdown', 'pointerup', 'keydown', 'keyup']) {
        this.host.addEventListener(name, (event) => event.stopPropagation());
      }
    }
    show(container, message, repeatSeconds = 0) {
      if (!container?.isConnected) return this.hide();
      if (this.host.parentElement !== container) { this.hide(); container.append(this.host); }
      if (this.message.textContent !== message) this.message.textContent = message;
      const label = repeatSeconds > 0
        ? t(repeatSeconds % 60 === 0 ? 'repeatMinutes' : 'repeatSeconds', String(repeatSeconds % 60 === 0 ? repeatSeconds / 60 : repeatSeconds))
        : t('continuePlayback');
      if (this.continueButton.textContent !== label) this.continueButton.textContent = label;
      if (!this.panel.matches(':popover-open')) this.panel.showPopover();
    }
    hide() { if (this.panel.matches(':popover-open')) this.panel.hidePopover(); }
    destroy() { this.hide(); this.host.remove(); }
  }
  globalThis.StreamSleepTimer.StopNotice = StopNotice;
})();
