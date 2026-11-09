(() => {
  class MediaBinding {
    constructor({ onPlaybackChange, onEnded }) {
      this.onPlaybackChange = onPlaybackChange;
      this.onEnded = onEnded;
      this.video = null;
      this.abort = null;
      this.playing = false;
    }

    canPlay() {
      const video = this.video;
      return Boolean(video?.isConnected && !video.paused && !video.ended && !video.seeking && video.readyState >= 3);
    }

    setPlaying(playing) {
      this.playing = playing;
      this.onPlaybackChange(playing);
    }

    // Polling may stop a timer, but only a media resume event or page restore
    // may restart it after a waiting event.
    sync({ resume = false } = {}) {
      if (resume) this.setPlaying(this.canPlay());
      else if (this.playing && !this.canPlay()) this.setPlaying(false);
    }

    bind(video) {
      if (video === this.video) return;
      this.unbind();
      this.video = video;
      this.abort = new AbortController();
      const listen = (event, handler) => video.addEventListener(event, handler, { signal: this.abort.signal });
      for (const event of ['playing', 'seeked']) listen(event, () => this.sync({ resume: true }));
      for (const event of ['pause', 'waiting', 'seeking', 'emptied']) listen(event, () => this.setPlaying(false));
      listen('ended', () => { this.setPlaying(false); this.onEnded(); });
      this.sync({ resume: true });
    }

    pause() {
      if (!this.video?.isConnected) return false;
      this.video.pause(); // Idempotent; never a play/pause toggle.
      return this.video.paused;
    }

    unbind() {
      this.setPlaying(false);
      this.abort?.abort();
      this.abort = null;
      this.video = null;
    }
  }
  globalThis.StreamSleepTimer.MediaBinding = MediaBinding;
})();
