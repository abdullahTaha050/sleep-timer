import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogs, locales, environment, loadExtension, mockMedia, read } from './helpers/environment.mjs';
import { createI18n, demoLocales } from './helpers/i18n.mjs';

for (const locale of ['tr', 'tr-TR', 'en', 'en-US', 'en-GB', 'nl-NL', 'sv']) {
  test(`menu and notice use browser UI locale ${locale} with English fallback`, async () => {
    const window = environment('https://unsupported.example/', locale);
    let ui, notice;
    try {
      // The site's language must not override Chrome's UI language.
      window.document.documentElement.lang = locale.startsWith('tr') ? 'en' : 'tr';
      await loadExtension(window);
      const app = window.StreamSleepTimer;
      const tr = locale.startsWith('tr');
      ui = new app.TimerUI(() => {}, { episodeEnd: true });
      ui.mount({ container: window.document.body });
      const root = ui.host.shadowRoot;
      assert.equal(ui.host.lang, tr ? 'tr' : 'en');
      assert.equal(ui.host.dir, 'ltr');
      assert.equal(root.querySelector('h2').textContent, tr ? 'Uyku zamanlayıcısı' : 'Sleep timer');
      assert.equal(root.querySelector('.close').getAttribute('aria-label'), tr ? 'Menüyü kapat' : 'Close menu');
      assert.equal(ui.status.textContent, tr ? 'Zamanlayıcı kapalı' : 'Timer off');
      assert.match(root.querySelector('input[value="600"]').parentElement.textContent, tr ? /10 dakika/ : /10 minutes/);
      assert.match(root.querySelector('input[value="5"]').parentElement.textContent, tr ? /5 sn/ : /5 sec/);
      assert.match(root.querySelector('input[value="episode"]').parentElement.textContent, tr ? /Bölüm sonunda/ : /End of episode/);
      ui.render({ active: true, guarding: true, selection: 600, remainingMs: 65000, playing: true });
      assert.equal(ui.status.textContent, tr ? 'Kalan 01:05 · Çalışıyor' : 'Remaining 01:05 · Running');
      assert.equal(ui.button.getAttribute('aria-label'), tr ? 'Uyku zamanlayıcısı · 01:05' : 'Sleep timer · 01:05');
      ui.render({ active: true, guarding: true, selection: 600, remainingMs: 65000, playing: false });
      assert.equal(ui.status.textContent, tr ? 'Kalan 01:05 · Bekliyor' : 'Remaining 01:05 · Paused');
      ui.render({ guarding: true, selection: 'episode' });
      assert.equal(ui.status.textContent, tr ? 'Bölüm sonu bekleniyor' : 'Waiting for episode end');
      let continues = 0, cancels = 0;
      notice = new app.StopNotice({ onContinue: () => continues++, onCancel: () => cancels++ });
      notice.show(window.document.body, app.config.messages.expired);
      assert.equal(notice.host.lang, tr ? 'tr' : 'en');
      assert.equal(notice.message.textContent, tr ? 'Süre doldu.' : 'Time is up');
      const buttons = notice.host.shadowRoot.querySelectorAll('button');
      assert.deepEqual(Array.from(buttons, (button) => button.textContent),
        tr ? ['Devam et', 'Zamanlayıcıyı kapat'] : ['Continue', 'Turn off timer']);
      buttons[0].click(); buttons[1].click();
      assert.equal(continues, 1); assert.equal(cancels, 1);
      notice.show(window.document.body, app.config.messages.expired, 300);
      assert.equal(buttons[0].textContent, tr ? '5 dakika daha' : '5 more minutes');
      notice.show(window.document.body, app.config.messages.expired, 5);
      assert.equal(buttons[0].textContent, tr ? '5 sn daha' : '5 more sec');
      notice.show(window.document.body, app.config.messages.episode);
      assert.equal(buttons[0].textContent, tr ? 'Devam et' : 'Continue');
      assert.deepEqual({ ...app.config.messages }, tr ? {
        expired: 'Süre doldu.', pauseFailed: 'Video duraklatılamadı', ended: 'Video bitti',
        episode: 'Bölüm sonunda durduruldu', transition: 'Bölüm değişiminde durduruldu',
        resumeFailed: 'Oynatma başlatılamadı · Oynat düğmesini kullanın',
      } : {
        expired: 'Time is up', pauseFailed: 'Could not pause the video', ended: 'Video ended',
        episode: 'Paused at episode end', transition: 'Paused on episode change',
        resumeFailed: 'Could not resume playback · Use the Play button',
      });
    } finally { ui?.destroy(); notice?.destroy(); await window.happyDOM.close(); }
  });
}

test('all 23 catalogs cover every message, substitution and manifest description', async () => {
  const en = catalogs.en;
  assert.equal(locales.length, 23);
  assert.deepEqual(locales, [...demoLocales].sort());
  for (const [locale, catalog] of Object.entries(catalogs)) {
    assert.deepEqual(Object.keys(catalog).sort(), Object.keys(en).sort(), locale);
    assert.equal(catalog.languageCode.message, locale.replace('_', '-'));
    for (const [key, entry] of Object.entries(catalog)) {
      assert.ok(entry.message.length > 0);
      assert.doesNotMatch(entry.message, /[<>]|TODO|FIXME/);
      assert.deepEqual(entry.placeholders ?? {}, en[key].placeholders ?? {}, `${locale}.${key}`);
      assert.deepEqual([...entry.message.matchAll(/\$(\w+)\$/g)].map((match) => match[1]).sort(),
        [...en[key].message.matchAll(/\$(\w+)\$/g)].map((match) => match[1]).sort(), `${locale}.${key}`);
      for (const [, name] of entry.message.matchAll(/\$(\w+)\$/g)) {
        assert.match(entry.placeholders[name].content, /^\$[12]$/);
      }
    }
    assert.ok(catalog.extensionDescription.message.length <= 132);
  }
  const manifest = JSON.parse(await read('extension/manifest.json'));
  assert.equal(manifest.default_locale, 'en');
  assert.equal(manifest.description, '__MSG_extensionDescription__');
});

const translatedTitles = {
  ar: 'مؤقت النوم', de: 'Einschlaftimer', es: 'Temporizador de apagado', fa: 'تایمر خواب',
  fr: 'Minuterie de veille', he: 'טיימר שינה', hi: 'स्लीप टाइमर', id: 'Pengatur waktu tidur',
  it: 'Timer di spegnimento', ja: 'スリープタイマー', ko: '수면 타이머', ms: 'Pemasa tidur',
  pl: 'Wyłącznik czasowy', pt_BR: 'Temporizador de sono', pt_PT: 'Temporizador de sono',
  ru: 'Таймер сна', th: 'ตัวตั้งเวลาปิด', ur: 'سلیپ ٹائمر', vi: 'Hẹn giờ ngủ',
  zh_CN: '睡眠定时器', zh_TW: '睡眠計時器',
};

for (const [locale, title] of Object.entries(translatedTitles)) {
  test(`${locale}: translated controls, repeat action, direction and isolated countdown`, async () => {
    const window = environment('https://unsupported.example/', locale.replace('_', '-'));
    let ui, notice;
    try {
      window.document.documentElement.lang = 'en';
      window.document.documentElement.dir = 'ltr';
      await loadExtension(window);
      const app = window.StreamSleepTimer;
      const rtl = ['ar', 'fa', 'he', 'ur'].includes(locale);
      const { t } = app.i18n;
      ui = new app.TimerUI(() => {}, { episodeEnd: true });
      ui.mount({ container: window.document.body });
      assert.equal(ui.host.lang, locale.replace('_', '-'));
      assert.equal(ui.host.dir, rtl ? 'rtl' : 'ltr');
      assert.equal(ui.host.shadowRoot.querySelector('h2').textContent, title);
      assert.equal(ui.host.shadowRoot.querySelector('.close').getAttribute('aria-label'), catalogs[locale].closeMenu.message);
      ui.render({ active: true, guarding: true, selection: 600, remainingMs: 65000, playing: true });
      assert.ok(ui.status.textContent.includes(rtl ? '\u206801:05\u2069' : '01:05'));
      assert.ok(ui.status.textContent.includes(catalogs[locale].running.message));
      ui.render({ active: true, guarding: true, selection: 600, remainingMs: 65000, playing: false });
      assert.ok(ui.status.textContent.includes(catalogs[locale].waiting.message));
      assert.equal(ui.button.getAttribute('aria-label'), t('timerStatus', '01:05'));
      let repeats = 0, cancels = 0;
      notice = new app.StopNotice({ onContinue: () => repeats++, onCancel: () => cancels++ });
      notice.show(window.document.body, app.config.messages.expired, 600);
      assert.equal(notice.host.lang, ui.host.lang);
      assert.equal(notice.host.dir, ui.host.dir);
      assert.equal(notice.panel.getAttribute('aria-label'), title);
      assert.equal(notice.message.textContent, catalogs[locale].expired.message);
      assert.equal(notice.continueButton.textContent, t('repeatMinutes', '10'));
      const buttons = notice.host.shadowRoot.querySelectorAll('button');
      assert.equal(buttons.length, 2);
      assert.equal(buttons[0], notice.continueButton);
      assert.equal(buttons[1].textContent, catalogs[locale].turnOffTimer.message);
      buttons[0].click(); buttons[1].click();
      assert.equal(repeats, 1); assert.equal(cancels, 1);
      notice.show(window.document.body, app.config.messages.expired, 5);
      assert.equal(notice.continueButton.textContent, t('repeatSeconds', '5'));
      notice.show(window.document.body, app.config.messages.episode);
      assert.equal(notice.continueButton.textContent, catalogs[locale].continuePlayback.message);
      for (const key of Object.keys(catalogs.en)) {
        const message = t(key, ['10', catalogs[locale].running.message]);
        assert.ok(message.length > 0);
        assert.doesNotMatch(message, /\$\w+\$/);
      }
    } finally { ui?.destroy(); notice?.destroy(); await window.happyDOM.close(); }
  });
}

for (const [requested, expected] of [
  ['de-DE', 'de'], ['fr-CA', 'fr'], ['es-MX', 'es'], ['ar-EG', 'ar'], ['ur-PK', 'ur'],
  ['he-IL', 'he'], ['pt-BR', 'pt_BR'], ['pt-PT', 'pt_PT'], ['pt_BR', 'pt_BR'],
  ['zh-CN', 'zh_CN'], ['zh-TW', 'zh_TW'], ['zh_TW', 'zh_TW'], ['nl-NL', 'en'],
]) {
  test(`${requested}: language metadata follows the selected catalog ${expected}`, async () => {
    const window = environment('https://unsupported.example/', requested);
    try {
      await loadExtension(window);
      const i18n = window.StreamSleepTimer.i18n;
      assert.equal(i18n.language, expected.replace('_', '-'));
      assert.equal(i18n.t('extensionDescription'), catalogs[expected].extensionDescription.message);
    } finally { await window.happyDOM.close(); }
  });
}

test('missing regional messages fall back to base language then English in the Chrome test double', () => {
  const i18n = createI18n('fr-CA', {
    en: { onlyDefault: { message: 'Default' } },
    fr: { onlyBase: { message: 'Base' } },
    fr_CA: { regional: { message: 'Regional' } },
  });
  assert.equal(i18n.getMessage('regional'), 'Regional');
  assert.equal(i18n.getMessage('onlyBase'), 'Base');
  assert.equal(i18n.getMessage('onlyDefault'), 'Default');
});

for (const platform of ['netflix', 'hbo']) {
  test(`${platform} countdown, stop and continue work with English messages`, async () => {
    const window = environment(platform === 'netflix'
      ? 'https://www.netflix.com/watch/100' : 'https://www.hbomax.com/video/watch/100', 'en-US');
    let controller;
    try {
      window.document.body.innerHTML = platform === 'hbo' ? await read('tests/fixtures/hbo-player.html') : `
        <div data-uia="player" data-videoid="100">
          <div data-uia="video-canvas"><video></video></div>
          <div data-uia="controls-standard"><div><button data-uia="control-next">Next</button><button data-uia="control-speed">Speed</button></div></div>
        </div>`;
      const video = window.document.querySelector(platform === 'hbo' ? 'video[data-testid="VideoElement"]' : 'video');
      mockMedia(window, video);
      await loadExtension(window, `
        window.clock = 0;
        const Timer = StreamSleepTimer.PlaybackTimer;
        StreamSleepTimer.PlaybackTimer = class extends Timer {
          constructor(options) { super({ ...options, now: () => window.clock }); }
        };
      `);
      controller = window.StreamSleepTimer.instance;
      await video.play();
      controller.select(5);
      assert.equal(controller.ui.status.textContent, 'Remaining 00:05 · Running');
      video.pause(); controller.tick();
      assert.equal(controller.ui.status.textContent, 'Remaining 00:05 · Paused');
      await video.play(); window.clock = 6000; controller.tick();
      assert.equal(video.paused, true);
      assert.equal(controller.notice.message.textContent, 'Time is up');
      controller.notice.host.shadowRoot.querySelector('.continue').click();
      assert.equal(video.paused, false);
      assert.equal(controller.ui.status.textContent, 'Remaining 00:05 · Running');
    } finally { controller?.destroy(); await window.happyDOM.close(); }
  });
}
