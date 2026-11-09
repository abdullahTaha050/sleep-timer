(() => {
  const app = globalThis.StreamSleepTimer;
  if (app.instance) return;
  const adapter = app.platforms.resolve(location);
  if (!adapter) return;
  app.instance = new app.PlayerController({ adapter });
  app.instance.start();
})();
