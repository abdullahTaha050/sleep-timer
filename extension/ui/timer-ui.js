(() => {
  const MOON = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.2 14.3A8.5 8.5 0 0 1 9.7 3.8a8.5 8.5 0 1 0 10.5 10.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const format = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  class TimerUI {
    constructor(onSelect, { episodeEnd = false } = {}) {
      this.host = document.createElement('span');
      this.host.dataset.sleepTimer = 'control';
      this.host.style.cssText = 'display:inline-flex;align-items:center;flex-shrink:0;position:relative;pointer-events:auto;';
      const shadow = this.host.attachShadow({ mode: 'open' });
      const { durationSeconds, testSeconds } = globalThis.StreamSleepTimer.config;
      const options = [[0, 'Kapalı'], ...durationSeconds.map((seconds) => [seconds, `${seconds / 60} dakika`])];
      if (episodeEnd) options.push(['episode', 'Bölüm sonunda']);
      const option = ([seconds, label], test = false) => `<label class="${test ? 'test-choice' : 'choice'}"><input type="radio" name="duration" value="${seconds}"><span class="check" aria-hidden="true">✓</span><span>${label}</span></label>`;
      shadow.innerHTML = `
        <style>${globalThis.StreamSleepTimer.uiStyles}</style>
        <button class="trigger" type="button" title="Uyku zamanlayıcısı" aria-label="Uyku zamanlayıcısı" aria-haspopup="dialog" aria-expanded="false" aria-controls="sleep-panel">${MOON}</button>
        <section class="panel" id="sleep-panel" popover="auto" role="dialog" aria-labelledby="sleep-heading">
          <div class="heading"><div class="top"><h2 id="sleep-heading">Uyku zamanlayıcısı</h2><button class="close" type="button" aria-label="Menüyü kapat">×</button></div><p class="status" aria-live="off">Zamanlayıcı kapalı</p></div>
          <div class="options" role="group" aria-label="Süre">${options.map((item) => option(item)).join('')}</div>
          <details class="testing"><summary>Test süreleri</summary><div class="test-options" role="group" aria-label="Saniyelik test süreleri">${testSeconds.map((s) => option([s, `${s} sn`], true)).join('')}</div></details>
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
          onSelect(event.target.value === 'episode' ? 'episode' : Number(event.target.value));
          this.close(true);
        }
      });
      shadow.querySelector('details').addEventListener('toggle', () => this.position());
      // Prevent player keyboard shortcuts/click handlers from also handling our UI.
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
      const selected = state.guarding ? (state.stopped ? 'stopped' : state.selection) : 0;
      for (const input of this.inputs) input.checked = input.value === String(selected);
      const status = state.stopped ? message
        : state.guarding && state.selection === 'episode' ? 'Bölüm sonu bekleniyor'
        : state.active
        ? `Kalan ${format(state.remainingMs)} · ${state.playing ? 'Çalışıyor' : 'Bekliyor'}`
        : message || 'Zamanlayıcı kapalı';
      if (this.status.textContent !== status) this.status.textContent = status;
      this.button.dataset.active = String(Boolean(state.guarding));
      const title = state.stopped ? 'Uyku zamanlayıcısı · Koruma açık'
        : state.guarding && state.selection === 'episode' ? 'Uyku zamanlayıcısı · Bölüm sonunda'
        : state.active ? `Uyku zamanlayıcısı · ${format(state.remainingMs)}` : 'Uyku zamanlayıcısı';
      if (this.button.title !== title) {
        this.button.title = title;
        this.button.setAttribute('aria-label', title);
      }
    }

    mount({ container, before }, appearance = {}) {
      // Omitted before means prepend; explicit null means append.
      const anchor = before === undefined ? container.firstChild : before;
      if (anchor !== this.host && (this.host.parentElement !== container || this.host.nextSibling !== anchor)) {
        this.close();
        container.insertBefore(this.host, anchor);
      }
      const properties = { iconSize: '--st-icon-size', controlSize: '--st-control-size', controlPadding: '--st-control-padding' };
      for (const [key, property] of Object.entries(properties)) {
        if (appearance[key]) this.host.style.setProperty(property, appearance[key]);
        else this.host.style.removeProperty(property);
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
