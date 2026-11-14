(() => {
  const app = globalThis.StreamSleepTimer;
  if (app.bootstrapped) return;
  const adapter = app.platforms.resolve(location);
  if (!adapter) return;
  app.bootstrapped = true;
  const subscription = app.settings.observe((enabled) => {
    if (enabled) {
      if (app.instance) return;
      app.instance = new app.PlayerController({ adapter });
      app.instance.start();
    } else {
      // Cancels timers and releases the guard without playing or pausing media.
      app.instance?.destroy();
      app.instance = null;
    }
  });
  app.ready = subscription.ready;
  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) subscription.unsubscribe();
  });
})();
