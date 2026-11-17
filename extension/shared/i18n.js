(() => {
  globalThis.StreamSleepTimer ??= {};
  // Read the language from the selected catalog, including Chrome's fallback.
  // The browser UI language can differ from the translation actually in use.
  const language = chrome.i18n.getMessage('languageCode') || 'en';
  const direction = /^(ar|fa|he|ur)$/.test(language) ? 'rtl' : 'ltr';
  globalThis.StreamSleepTimer.i18n = Object.freeze({
    language,
    direction,
    t: (key, substitutions) => {
      // Isolate inserted countdowns/numbers so RTL text cannot reorder 01:05.
      const values = substitutions === undefined ? []
        : Array.isArray(substitutions) ? substitutions : [substitutions];
      return chrome.i18n.getMessage(key, direction === 'rtl'
        ? values.map((value) => `\u2068${value}\u2069`) : values);
    },
  });
})();
