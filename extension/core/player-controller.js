(() => {
  const app = globalThis.StreamSleepTimer;

  class PlayerController {
    constructor({ adapter, createUI = (select, options) => new app.TimerUI(select, options) }) {
      this.adapter = adapter;
      this.createUI = createUI;
      this.context = { document, location };
      this.key = null;
      this.root = null;
      this.ui = null;
      this.notice = null;
      this.message = '';
      this.cycle = 0;
      this.started = false;
      this.pausing = false;
      this.reconcileTimeout = null;
      this.guard = new app.PlaybackGuard();
      this.cancelledSignals = new WeakSet();
      this.cancelAttempts = 0;
      this.timer = new app.PlaybackTimer({ onExpire: () => this.stop('timer') });
      this.media = new app.MediaBinding({
        onPlaybackChange: (playing) => {
          if (this.guard.stopped && playing) this.hold();
          this.timer.setPlaying(this.guard.stopped ? false : playing);
          // Expiry may synchronously pause during setPlaying's preceding-interval settlement.
          if (this.guard.stopped && this.timer.playing) this.timer.setPlaying(false);
          this.render();
        },
        onEnded: () => { if (this.guard.enabled) this.stop('ended'); },
      });
    }

    render() {
      this.ui?.render({ ...this.timer.snapshot(), guarding: this.guard.enabled,
        stopped: this.guard.stopped, selection: this.guard.selection }, this.message);
      if (this.guard.stopped && this.root?.isConnected) {
        this.notice ??= new app.StopNotice({ onContinue: () => this.resume(), onCancel: () => this.cancel() });
        this.notice.show(this.root, this.message);
      } else this.notice?.hide();
    }

    hold() {
      const video = this.media.video;
      if (this.pausing || !video?.isConnected || video.paused) return;
      this.pausing = true;
      try {
        const paused = this.adapter.pause ? this.adapter.pause(video) : this.media.pause();
        if (!paused) this.message = app.config.messages.pauseFailed;
      } catch { this.message = app.config.messages.pauseFailed; }
      finally { this.pausing = false; }
    }

    stop(reason) {
      if (!this.guard.enabled) return;
      this.guard.stop(reason);
      this.timer.cancel();
      const messages = app.config.messages;
      this.message = ({ timer: messages.expired, episode: messages.episode,
        ended: messages.ended, transition: messages.transition })[this.guard.reason];
      this.hold();
      this.render();
    }

    reset() {
      this.guard.clear();
      this.timer.cancel();
      this.cancelledSignals = new WeakSet();
      this.cancelAttempts = 0;
      this.message = '';
      this.notice?.hide();
    }

    cancel() { this.reset(); this.render(); }

    resume() {
      // Only this explicit action releases the protection and initiates playback.
      const key = this.readKey();
      const video = key === null ? null : this.adapter.findPlayer(this.context)?.video;
      this.reset();
      this.render();
      try {
        video?.play()?.catch(() => {
          if (!this.guard.enabled) { this.message = app.config.messages.resumeFailed; this.render(); }
        });
      } catch { this.message = app.config.messages.resumeFailed; this.render(); }
    }

    readKey() { return this.adapter.getPlaybackKey(this.context); }

    select(selection) {
      const key = this.readKey();
      const current = key === null ? null : this.adapter.findPlayer(this.context);
      if (!current || key !== this.key || current.video !== this.media.video) { this.reconcile(); return; }
      if (selection === 'episode' && !this.adapter.getEpisodeEnd) return;
      if (selection !== 'episode' && (!Number.isFinite(selection) || selection < 0)) return;
      this.reset();
      if (selection !== 0) {
        this.guard.arm(key, selection);
        if (selection !== 'episode') this.timer.start(selection);
        this.inspectBoundary(); // Also handles arming while the end card is already visible.
      }
      this.render();
    }

    inspectBoundary() {
      if (!this.guard.enabled || !this.media.video?.isConnected) return;
      const boundary = this.adapter.getEpisodeEnd?.({ ...this.context, video: this.media.video });
      if (!boundary) return;
      // Stop first: Watch Credits can itself synchronously resume or replace the video.
      this.stop('episode');
      if (this.adapter.cancelAutoplay && boundary.cancelButton &&
          !this.cancelledSignals.has(boundary.signal) && this.cancelAttempts < app.config.maxAutoplayCancelAttempts) {
        this.cancelledSignals.add(boundary.signal);
        this.cancelAttempts++;
        try { this.adapter.cancelAutoplay(boundary); } catch { /* Pause guard remains armed. */ }
        this.hold();
      }
    }

    reconcile() {
      const key = this.readKey();
      if (key === null) this.reset();
      else if (key !== this.key) {
        if (this.guard.enabled) this.stop('transition');
        else this.reset();
      }
      if (key !== this.key) this.ui?.close();
      this.key = key;
      const found = key === null ? null : this.adapter.findPlayer(this.context);
      if (!found?.video) {
        this.media.unbind();
        this.root = null;
        this.ui?.destroy();
        this.ui = null;
        this.notice?.hide();
        return;
      }
      this.root = found.root ?? found.video.parentElement;
      this.media.bind(found.video);
      this.inspectBoundary();
      if (this.guard.stopped) this.hold();
      // The cancel action above may have detached the previous control group.
      if (found.mount?.container.isConnected) {
        this.ui ??= this.createUI((selection) => this.select(selection), { episodeEnd: Boolean(this.adapter.getEpisodeEnd) });
        this.ui.mount(found.mount, this.adapter.appearance);
      } else {
        this.ui?.destroy();
        this.ui = null;
      }
      this.render();
    }

    tick() {
      if (this.readKey() !== this.key || !this.media.video?.isConnected || ++this.cycle % app.config.reconcileEveryTicks === 0) this.reconcile();
      this.inspectBoundary();
      if (this.guard.stopped) this.hold();
      this.media.sync();
      this.timer.tick();
      this.render();
    }

    start() {
      if (this.started) return;
      this.started = true;
      this.events = new AbortController();
      this.observer = new MutationObserver((records) => {
        if (records.every((record) => record.target.closest?.('[data-sleep-timer], [data-sleep-timer-notice]'))) return;
        if (this.reconcileTimeout !== null) return;
        this.reconcileTimeout = setTimeout(() => {
          this.reconcileTimeout = null;
          this.reconcile();
        }, app.config.mutationDelayMs);
      });
      this.observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true,
        attributeFilter: ['data-uia', 'data-videoid', 'class', 'style', 'hidden', 'aria-hidden'] });
      this.interval = setInterval(() => this.tick(), app.config.tickMs);
      // Capture play from newly-created media before the regular rebinding poll.
      document.addEventListener('play', () => {
        if (this.guard.enabled && (this.guard.stopped || this.readKey() !== this.key)) this.reconcile();
      }, { capture: true, signal: this.events.signal });
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
      this.notice?.destroy();
      this.ui = null;
      this.notice = null;
      this.root = null;
      this.started = false;
    }
  }
  app.PlayerController = PlayerController;
})();
