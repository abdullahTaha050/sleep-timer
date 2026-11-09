(() => {
  class PlatformRegistry {
    constructor() { this.adapters = new Map(); }

    register(adapter) {
      if (!adapter.id || !['matches', 'getPlaybackKey', 'findPlayer'].every((method) => typeof adapter[method] === 'function')) {
        throw new TypeError('An adapter needs id, matches, getPlaybackKey and findPlayer');
      }
      if (this.adapters.has(adapter.id)) throw new Error(`Duplicate platform: ${adapter.id}`);
      this.adapters.set(adapter.id, adapter);
    }

    resolve(location) {
      return [...this.adapters.values()].find((adapter) => adapter.matches(location)) ?? null;
    }
  }
  globalThis.StreamSleepTimer.PlatformRegistry = PlatformRegistry;
  globalThis.StreamSleepTimer.platforms = new PlatformRegistry();
})();
