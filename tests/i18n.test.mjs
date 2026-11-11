import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment, loadExtension, mockMedia, read } from './helpers/environment.mjs';

for (const locale of ['tr', 'tr-TR', 'en', 'en-US', 'en-GB', 'de-DE', 'ar']) {
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

test('both catalogs cover every message and substitution, including manifest description', async () => {
  const en = JSON.parse(await read('extension/_locales/en/messages.json'));
  const tr = JSON.parse(await read('extension/_locales/tr/messages.json'));
  assert.deepEqual(Object.keys(tr).sort(), Object.keys(en).sort());
  for (const catalog of [en, tr]) {
    for (const entry of Object.values(catalog)) {
      assert.ok(entry.message.length > 0);
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
