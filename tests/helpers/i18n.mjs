// Local test/demo stand-in for Chrome's native catalog lookup. Never packaged
// as extension runtime code; it cannot verify Chrome's real locale selection.
export function createI18n(language, catalogs) {
  const locale = language.toLowerCase().split(/[-_]/)[0];
  return {
    getUILanguage: () => language,
    getMessage(key, substitutions = []) {
      const entry = catalogs[locale]?.[key] ?? catalogs.en[key];
      if (!entry) throw new Error(`Missing translation: ${key}`);
      const values = Array.isArray(substitutions) ? substitutions : [substitutions];
      return entry.message.replace(/\$(\w+)\$/g, (_, name) => {
        const content = entry.placeholders?.[name.toLowerCase()]?.content;
        if (!content) throw new Error(`Missing placeholder: ${key}.${name}`);
        return content.replace(/\$(\d+)/g, (_, index) => values[Number(index) - 1] ?? '');
      });
    },
  };
}

export async function installDemoI18n() {
  const entries = await Promise.all(['en', 'tr'].map(async (locale) => {
    const response = await fetch(`/extension/_locales/${locale}/messages.json`);
    if (!response.ok) throw new Error(`Could not load ${locale} translations`);
    return [locale, await response.json()];
  }));
  globalThis.chrome ??= {};
  globalThis.chrome.i18n = createI18n(navigator.language, Object.fromEntries(entries));
}
