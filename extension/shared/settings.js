(() => {
  const app = globalThis.StreamSleepTimer ??= {};
  app.settings = Object.freeze({
    setEnabled: (enabled) => chrome.storage.local.set({ enabled }),
    observe(onChange, onError = () => {}) {
      // The standalone player demo has no extension storage API.
      if (!chrome.storage) {
        onChange(true);
        return { ready: Promise.resolve(), unsubscribe() {} };
      }
      let revision = 0;
      let disposed = false;
      const changed = (changes, area) => {
        if (area !== 'local' || !Object.hasOwn(changes, 'enabled') || disposed) return;
        revision++;
        onChange(changes.enabled.newValue !== false);
      };
      chrome.storage.onChanged.addListener(changed);
      const ready = chrome.storage.local.get({ enabled: true }).then(({ enabled }) => {
        // A storage event received during the read is newer than its snapshot.
        if (!disposed && revision === 0) onChange(enabled !== false);
      }).catch((error) => { if (!disposed && revision === 0) onError(error); });
      return { ready, unsubscribe() {
        disposed = true;
        chrome.storage.onChanged.removeListener(changed);
      } };
    },
  });
})();
