(() => {
  globalThis.StreamSleepTimer ??= {};
  globalThis.StreamSleepTimer.i18n = Object.freeze({
    language: /^tr(?:[-_]|$)/i.test(chrome.i18n.getUILanguage()) ? 'tr' : 'en',
    t: (key, substitutions) => chrome.i18n.getMessage(key, substitutions),
  });
})();
