(() => {
  const app = globalThis.StreamSleepTimer;
  if (app.started) return;
  app.started = true;
  const { PlaybackTimer, TimerUI, netflix } = app;
  let video = null;
  let key = null;
  let abort = null;
  let ui = null;
  let message = '';
  let reconcileTimeout = null;
  let cycle = 0;

  const timer = new PlaybackTimer({ onExpire() {
    if (!video?.isConnected) return;
    try {
      message = netflix.pause(video) ? 'Süre doldu · Video duraklatıldı' : 'Video duraklatılamadı';
    } catch {
      message = 'Video duraklatılamadı';
    }
  } });

  function render() { ui?.render(timer.snapshot(), message); }

  function unbind() {
    timer.setPlaying(false);
    abort?.abort();
    abort = null;
    video = null;
  }

  function bind(next) {
    if (video === next) return;
    unbind();
    video = next;
    abort = new AbortController();
    const listen = (name, callback) => video.addEventListener(name, callback, { signal: abort.signal });
    const stop = () => { timer.setPlaying(false); render(); };
    const resume = () => {
      timer.setPlaying(!video.paused && !video.ended && !video.seeking && video.readyState >= 3);
      render();
    };
    listen('playing', resume);
    listen('seeked', resume);
    for (const event of ['pause', 'waiting', 'seeking', 'emptied']) listen(event, stop);
    listen('ended', () => {
      stop();
      if (timer.active) {
        timer.cancel();
        message = 'Video bitti · Zamanlayıcı kapatıldı';
        render();
      }
    });
    resume();
  }

  function reconcile() {
    const found = netflix.locate();
    if (!found) {
      // Leaving /watch cancels; a temporary player rebuild on the same route only suspends.
      const routeKey = location.pathname.match(/^\/watch\/(\d+)/)?.[1] ?? null;
      if (key !== routeKey || !routeKey) { timer.cancel(); message = ''; key = routeKey; }
      unbind();
      ui?.destroy();
      ui = null;
      return;
    }
    if (key !== found.key) {
      timer.cancel();
      message = '';
      key = found.key;
      ui?.close();
    }
    bind(found.video);
    if (found.group) {
      ui ??= new TimerUI((seconds) => {
        // The popup may outlive a navigation by a few milliseconds.
        const current = netflix.locate();
        if (!current || current.key !== key || current.video !== video) { reconcile(); return; }
        message = '';
        if (seconds === 0) timer.cancel();
        else timer.start(seconds);
        render();
      });
      ui.mount(found.group);
    }
    render();
  }

  const observer = new MutationObserver((records) => {
    if (records.every((record) => record.target.closest?.('[data-sleep-timer]'))) return;
    if (reconcileTimeout !== null) return;
    reconcileTimeout = setTimeout(() => { reconcileTimeout = null; reconcile(); }, 80);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  const interval = setInterval(() => {
    const routeKey = location.pathname.match(/^\/watch\/(\d+)/)?.[1] ?? null;
    if (routeKey !== key || !video?.isConnected || ++cycle % 4 === 0) reconcile();
    // Guard against missed pause events; never start playback just to satisfy a timer.
    if (video && (video.paused || video.ended || video.seeking || video.readyState < 3) && timer.playing) {
      timer.setPlaying(false);
    }
    timer.tick();
    render();
  }, 250);
  window.addEventListener('pagehide', (event) => {
    timer.cancel();
    timer.setPlaying(false);
    message = '';
    if (!event.persisted) {
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(reconcileTimeout);
      abort?.abort();
      ui?.destroy();
    }
  });
  window.addEventListener('pageshow', () => {
    reconcile();
    // BFCache can restore an already-playing element without emitting a fresh playing event.
    if (video) timer.setPlaying(!video.paused && !video.ended && !video.seeking && video.readyState >= 3);
    render();
  });
  reconcile();
})();
