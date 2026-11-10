(() => {
  class StopNotice {
    constructor({ onContinue, onCancel }) {
      this.host = document.createElement('span');
      this.host.dataset.sleepTimerNotice = '';
      const shadow = this.host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          :host { color-scheme: dark; }
          .notice { position: fixed; inset: auto; bottom: 8vh; left: 50%; transform: translateX(-50%); box-sizing: border-box; width: min(380px, calc(100vw - 32px)); margin: 0; padding: 18px; border: 1px solid #ffffff25; border-radius: 12px; background: #18181bf5; color: #f5f5f5; font: 14px/1.5 Arial, sans-serif; box-shadow: 0 12px 40px #0008; }
          p { margin: 0 0 12px; }
          .actions { display: flex; flex-wrap: wrap; gap: 8px; }
          button { font: inherit; cursor: pointer; border-radius: 6px; padding: 8px 12px; border: 1px solid #ffffff30; background: transparent; color: inherit; }
          .continue { background: #a8efd0; color: #14231c; border-color: transparent; }
          button:focus-visible { outline: 2px solid #a8efd0; outline-offset: 3px; }
        </style>
        <section class="notice" popover="manual" aria-label="Uyku zamanlayıcısı durdurdu">
          <p role="status" aria-live="polite"></p>
          <div class="actions"><button class="continue" type="button">Devam et</button><button class="cancel" type="button">Zamanlayıcıyı kapat</button></div>
        </section>`;
      this.panel = shadow.querySelector('.notice');
      this.message = shadow.querySelector('p');
      shadow.querySelector('.continue').addEventListener('click', onContinue);
      shadow.querySelector('.cancel').addEventListener('click', onCancel);
      for (const name of ['click', 'dblclick', 'pointerdown', 'pointerup', 'keydown', 'keyup']) {
        this.host.addEventListener(name, (event) => event.stopPropagation());
      }
    }
    show(container, message) {
      if (!container?.isConnected) return this.hide();
      if (this.host.parentElement !== container) { this.hide(); container.append(this.host); }
      if (this.message.textContent !== message) this.message.textContent = message;
      if (!this.panel.matches(':popover-open')) this.panel.showPopover();
    }
    hide() { if (this.panel.matches(':popover-open')) this.panel.hidePopover(); }
    destroy() { this.hide(); this.host.remove(); }
  }
  globalThis.StreamSleepTimer.StopNotice = StopNotice;
})();
