/* Shared timer. Time means elapsed real time during playback, independent of playback speed. */
(() => {
  class PlaybackTimer {
    constructor({ now = () => performance.now(), onExpire = () => {} } = {}) {
      this.now = now;
      this.onExpire = onExpire;
      this.remainingMs = 0;
      this.durationMs = 0;
      this.active = false;
      this.playing = false;
      this.lastTime = now();
    }

    start(seconds) {
      if (!Number.isFinite(seconds) || seconds <= 0) throw new RangeError('Invalid duration');
      this.durationMs = seconds * 1000;
      this.remainingMs = this.durationMs;
      this.active = true;
      this.lastTime = this.now();
      return this.snapshot();
    }

    cancel() {
      this.active = false;
      this.remainingMs = 0;
      this.durationMs = 0;
      this.lastTime = this.now();
      return this.snapshot();
    }

    setPlaying(playing) {
      this.tick(); // Settle the preceding interval using its previous playback state.
      this.playing = Boolean(playing);
      this.lastTime = this.now();
      return this.snapshot();
    }

    tick() {
      const current = this.now();
      const elapsed = Math.max(0, current - this.lastTime);
      this.lastTime = current;
      if (this.active && this.playing) {
        this.remainingMs = Math.max(0, this.remainingMs - elapsed);
        if (this.remainingMs === 0) {
          this.active = false; // Set this before the callback: pause may synchronously reenter.
          this.onExpire();
        }
      }
      return this.snapshot();
    }

    snapshot() {
      return {
        active: this.active,
        playing: this.playing,
        remainingMs: this.remainingMs,
        durationMs: this.durationMs,
      };
    }
  }

  globalThis.StreamSleepTimer ??= {};
  globalThis.StreamSleepTimer.PlaybackTimer = PlaybackTimer;
  if (typeof module !== 'undefined') module.exports = { PlaybackTimer };
})();
