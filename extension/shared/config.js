(() => {
  globalThis.StreamSleepTimer ??= {};
  const { t } = globalThis.StreamSleepTimer.i18n;
  globalThis.StreamSleepTimer.config = Object.freeze({
    durationSeconds: Object.freeze([600, 900, 1200, 1800, 2700, 3600]),
    testSeconds: Object.freeze([5, 10, 30]),
    tickMs: 250,
    reconcileEveryTicks: 4,
    mutationDelayMs: 80,
    maxAutoplayCancelAttempts: 3,
    messages: Object.freeze({
      expired: t('expired'),
      pauseFailed: t('pauseFailed'),
      ended: t('ended'),
      episode: t('episodeStopped'),
      transition: t('transitionStopped'),
      resumeFailed: t('resumeFailed'),
    }),
  });
})();
