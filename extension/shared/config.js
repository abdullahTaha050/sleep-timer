(() => {
  globalThis.StreamSleepTimer ??= {};
  globalThis.StreamSleepTimer.config = Object.freeze({
    durationSeconds: Object.freeze([600, 900, 1200, 1800, 2700, 3600]),
    testSeconds: Object.freeze([5, 10, 30]),
    tickMs: 250,
    reconcileEveryTicks: 4,
    mutationDelayMs: 80,
    messages: Object.freeze({
      expired: 'Süre doldu · Video duraklatıldı',
      pauseFailed: 'Video duraklatılamadı',
      ended: 'Video bitti · Zamanlayıcı kapatıldı',
    }),
  });
})();
