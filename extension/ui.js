(() => {
  const MOON = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.2 14.3A8.5 8.5 0 0 1 9.7 3.8a8.5 8.5 0 1 0 10.5 10.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const format = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  class TimerUI {
    constructor(onSelect) {
      this.host = document.createElement('span');
      this.host.dataset.sleepTimer = 'control';
      this.host.style.cssText = 'display:inline-flex;align-items:center;flex-shrink:0;position:relative;pointer-events:auto;';
      const shadow = this.host.attachShadow({ mode: 'open' });
      const options = [[0, 'Kapalı'], ...[10, 15, 20, 30, 45, 60].map((m) => [m * 60, `${m} dakika`])];
      const option = ([seconds, label], test = false) => `<label class="${test ? 'test-choice' : 'choice'}"><input type="radio" name="duration" value="${seconds}"><span class="check" aria-hidden="true">✓</span><span>${label}</span></label>`;
      shadow.innerHTML = `
        <style>
          :host { color-scheme: dark; font-family: Arial, sans-serif; color: white; font-size: 14px; }
          * { box-sizing: border-box; }
          button, input, summary { -webkit-tap-highlight-color: transparent; }
          button { font: inherit; color: inherit; cursor: pointer; }
          .trigger { position: relative; display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 6px; padding: 5px; background: transparent; }
          .trigger svg { width: 34px; height: 34px; transition: transform .15s ease; }
          .trigger:hover svg { transform: scale(1.12); }
          .trigger[data-active="true"]::after { content: ''; position: absolute; bottom: 3px; width: 5px; height: 5px; border-radius: 50%; background: #a8efd0; }
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
          .check { width: 18px; color: #a8efd0; visibility: hidden; }
          input:checked ~ .check { visibility: visible; }
          .choice:has(input:checked) { background: #ffffff09; }
          .testing { border-top: 1px solid #ffffff15; padding: 12px 18px; }
          summary { color: #aaa; font-size: 12px; cursor: pointer; }
          .test-options { display: flex; gap: 8px; padding-top: 12px; }
          .test-choice { position: relative; display: flex; align-items: center; gap: 4px; padding: 7px 8px; border: 1px solid #ffffff20; border-radius: 6px; cursor: pointer; font-size: 12px; }
          .test-choice .check { width: 12px; }
          @media (prefers-reduced-motion: reduce) { .trigger svg { transition: none; } }
        </style>
        <button class="trigger" type="button" title="Uyku zamanlayıcısı" aria-label="Uyku zamanlayıcısı" aria-haspopup="dialog" aria-expanded="false" aria-controls="sleep-panel">${MOON}</button>
        <section class="panel" id="sleep-panel" popover="auto" role="dialog" aria-labelledby="sleep-heading">
          <div class="heading"><div class="top"><h2 id="sleep-heading">Uyku zamanlayıcısı</h2><button class="close" type="button" aria-label="Menüyü kapat">×</button></div><p class="status" aria-live="off">Zamanlayıcı kapalı</p></div>
          <div class="options" role="group" aria-label="Süre">${options.map((item) => option(item)).join('')}</div>
          <details class="testing"><summary>Test süreleri</summary><div class="test-options" role="group" aria-label="Saniyelik test süreleri">${[5, 10, 30].map((s) => option([s, `${s} sn`], true)).join('')}</div></details>
        </section>`;
      this.button = shadow.querySelector('.trigger');
      this.panel = shadow.querySelector('.panel');
      this.status = shadow.querySelector('.status');
      this.inputs = [...shadow.querySelectorAll('input')];
      this.isOpen = () => this.panel.matches(':popover-open');
      this.close = (restoreFocus = false) => {
        if (this.isOpen()) this.panel.hidePopover();
        if (restoreFocus && this.host.isConnected) this.button.focus();
      };
      this.button.addEventListener('click', () => {
        if (this.isOpen()) return this.close();
        this.panel.showPopover();
        this.position();
        const selected = this.inputs.find((input) => input.checked);
        const details = selected?.closest('details');
        if (details) details.open = true;
        this.position();
        selected?.focus({ preventScroll: true });
      });
      shadow.querySelector('.close').addEventListener('click', () => this.close(true));
      this.panel.addEventListener('toggle', () => this.button.setAttribute('aria-expanded', String(this.isOpen())));
      this.panel.addEventListener('change', (event) => {
        if (event.target.matches('input[name="duration"]')) {
          onSelect(Number(event.target.value));
          this.close(true);
        }
      });
      shadow.querySelector('details').addEventListener('toggle', () => this.position());
      // Prevent Netflix keyboard shortcuts/click handlers from also handling our UI.
      for (const event of ['click', 'dblclick', 'pointerdown', 'pointerup', 'keyup']) {
        this.host.addEventListener(event, (e) => e.stopPropagation());
      }
      this.host.addEventListener('keydown', (event) => {
        event.stopPropagation();
        if (event.key === 'Escape') { event.preventDefault(); this.close(true); }
      });
      this.resize = () => this.position();
      window.addEventListener('resize', this.resize);
      document.addEventListener('fullscreenchange', this.resize);
      this.render({ active: false, remainingMs: 0, durationMs: 0, playing: false });
    }

    position() {
      if (!this.isOpen()) return;
      const anchor = this.button.getBoundingClientRect();
      const { width, height } = this.panel.getBoundingClientRect();
      const left = Math.max(12, Math.min(anchor.right - width, window.innerWidth - width - 12));
      const top = Math.max(12, Math.min(anchor.top - height - 12, window.innerHeight - height - 12));
      this.panel.style.left = `${left}px`;
      this.panel.style.top = `${top}px`;
    }

    render(state, message = '') {
      const selected = state.active ? state.durationMs / 1000 : 0;
      for (const input of this.inputs) input.checked = Number(input.value) === selected;
      const status = state.active
        ? `Kalan ${format(state.remainingMs)} · ${state.playing ? 'Çalışıyor' : 'Bekliyor'}`
        : message || 'Zamanlayıcı kapalı';
      if (this.status.textContent !== status) this.status.textContent = status;
      this.button.dataset.active = String(state.active);
      const title = state.active ? `Uyku zamanlayıcısı · ${format(state.remainingMs)}` : 'Uyku zamanlayıcısı';
      if (this.button.title !== title) {
        this.button.title = title;
        this.button.setAttribute('aria-label', title);
      }
    }

    mount(group) {
      if (this.host.parentElement !== group) {
        this.close();
        group.prepend(this.host);
      }
    }

    destroy() {
      this.close();
      window.removeEventListener('resize', this.resize);
      document.removeEventListener('fullscreenchange', this.resize);
      this.host.remove();
    }
  }
  globalThis.StreamSleepTimer.TimerUI = TimerUI;
})();
