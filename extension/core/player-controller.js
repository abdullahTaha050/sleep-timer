(() => {
  const app = globalThis.StreamSleepTimer;

  class PlayerController {
    constructor({ adapter, createUI = (select) => new app.TimerUI(select) }) {
      this.adapter = adapter;
      this.createUI = createUI;
      this.context = { document, location };
      this.key = null;
      this.ui = null;
      this.message = '';
      this.cycle = 0;
      this.started = false;
      this.reconcileTimeout = null;
      this.timer = new app.PlaybackTimer({ onExpire: () => this.expire() });
      this.media = new app.MediaBinding({
        onPlaybackChange: (playing) => { this.timer.setPlaying(playing); this.render(); },
        onEnded: () => {
          if (this.timer.active) {
            this.timer.cancel();
            this.message = app.config.messages.ended;
            this.render();
          }
        },
      });
    }

    render() { this.ui?.render(this.timer.snapshot(), this.message); }

    expire() {
      if (!this.media.video?.isConnected) return;
      try {
        const paused = this.adapter.pause ? this.adapter.pause(this.media.video) : this.media.pause();
        this.message = paused ? app.config.messages.expired : app.config.messages.pauseFailed;
      } catch { this.message = app.config.messages.pauseFailed; }
    }

    reset() { this.timer.cancel(); this.message = ''; }

    readKey() { return this.adapter.getPlaybackKey(this.context); }

    select(seconds) {
      // A menu can outlive the document/player it was opened for.
      const key = this.readKey();
      const current = key === null ? null : this.adapter.findPlayer(this.context);
      if (!current || key !== this.key || current.video !== this.media.video) { this.reconcile(); return; }
      this.message = '';
      if (seconds === 0) this.timer.cancel();
      else this.timer.start(seconds);
      this.render();
    }

    reconcile() {
      const key = this.readKey();
      if (key !== this.key) {
        this.reset();
        this.key = key;
        this.ui?.close();
      }
      const found = key === null ? null : this.adapter.findPlayer(this.context);
      if (!found?.video) {
        // Missing player on the same key suspends rather than discards the timer.
        this.media.unbind();
        this.ui?.destroy();
        this.ui = null;
        return;
      }
      this.media.bind(found.video);
      if (found.mount) {
        this.ui ??= this.createUI((seconds) => this.select(seconds));
        this.ui.mount(found.mount, this.adapter.appearance);
      } else {
        this.ui?.destroy();
        this.ui = null;
      }
      this.render();
    }

    tick() {
      if (this.readKey() !== this.key || !this.media.video?.isConnected || ++this.cycle % app.config.reconcileEveryTicks === 0) this.reconcile();
      this.media.sync();
      this.timer.tick();
      this.render();
    }

    start() {
      if (this.started) return;
      this.started = true;
      this.events = new AbortController();
      this.observer = new MutationObserver((records) => {
        if (records.every((record) => record.target.closest?.('[data-sleep-timer]'))) return;
        if (this.reconcileTimeout !== null) return;
        this.reconcileTimeout = setTimeout(() => {
          this.reconcileTimeout = null;
          this.reconcile();
        }, app.config.mutationDelayMs);
      });
      this.observer.observe(document.documentElement, { childList: true, subtree: true });
      this.interval = setInterval(() => this.tick(), app.config.tickMs);
      window.addEventListener('pagehide', (event) => {
        this.reset();
        this.media.setPlaying(false);
        if (!event.persisted) this.destroy();
      }, { signal: this.events.signal });
      window.addEventListener('pageshow', () => {
        this.reconcile();
        this.media.sync({ resume: true });
        this.render();
      }, { signal: this.events.signal });
      this.reconcile();
    }

    destroy() {
      this.reset();
      this.observer?.disconnect();
      clearInterval(this.interval);
      clearTimeout(this.reconcileTimeout);
      this.reconcileTimeout = null;
      this.events?.abort();
      this.media.unbind();
      this.ui?.destroy();
      this.ui = null;
      this.started = false;
    }
  }
  app.PlayerController = PlayerController;
})();
