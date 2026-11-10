(() => {
  // Platform-independent session protection; never infer user intent from a play event.
  class PlaybackGuard {
    constructor() { this.clear(); }
    get enabled() { return this.state !== 'off'; }
    get stopped() { return this.state === 'stopped'; }
    arm(key, selection) {
      this.key = key;
      this.selection = selection;
      this.reason = null;
      this.state = 'armed';
    }
    stop(reason) {
      if (!this.enabled || this.stopped) return;
      this.state = 'stopped';
      this.reason = reason;
    }
    clear() { this.key = null; this.selection = 0; this.reason = null; this.state = 'off'; }
  }
  globalThis.StreamSleepTimer.PlaybackGuard = PlaybackGuard;
})();
