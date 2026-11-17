import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate as settle } from 'node:timers/promises';
import { environment, loadExtension, locales, mockMedia, read } from './helpers/environment.mjs';

function storageMock(initial = {}) {
  const data = { ...initial };
  const listeners = new Set();
  const storage = {
    failRead: false, failWrite: false,
    onChanged: { addListener: (fn) => listeners.add(fn), removeListener: (fn) => listeners.delete(fn) },
    local: {
      async get(defaults) {
        if (storage.failRead) throw new Error('Read failed');
        return { ...defaults, ...data };
      },
      async set(values) {
        if (storage.failWrite) throw new Error('Write failed');
        const changes = Object.fromEntries(Object.entries(values).map(([key, value]) =>
          [key, { oldValue: data[key], newValue: value }]));
        Object.assign(data, values);
        for (const fn of listeners) fn(changes, 'local');
      },
    },
  };
  return { storage, data, listeners };
}

async function player(platform, mock) {
  const window = environment(platform === 'hbo'
    ? 'https://www.hbomax.com/video/watch/100' : 'https://www.netflix.com/watch/100');
  window.chrome.storage = mock.storage;
  window.document.body.innerHTML = platform === 'hbo' ? await read('tests/fixtures/hbo-player.html') : `
    <div data-uia="player" data-videoid="100"><div data-uia="video-canvas"><video></video></div>
      <div data-uia="controls-standard"><div><button data-uia="control-next">Next</button><button data-uia="control-speed">Speed</button></div></div></div>`;
  const video = window.document.querySelector(platform === 'hbo' ? 'video[data-testid="VideoElement"]' : 'video');
  const media = mockMedia(window, video);
  await loadExtension(window);
  return { window, video, media, app: window.StreamSleepTimer };
}

async function popup(mock, locale = 'tr') {
  const window = environment('https://popup.example/', locale);
  window.chrome.storage = mock.storage;
  window.chrome.runtime = { getManifest: () => ({ version: '0.4.2' }) };
  window.document.write(await read('extension/popup/popup.html'));
  window.happyDOM.settings.disableJavaScriptEvaluation = false;
  for (const path of ['shared/i18n.js', 'shared/settings.js', 'popup/popup.js']) {
    window.eval(await read(`extension/${path}`));
  }
  await Promise.resolve();
  return window;
}

test('one saved switch controls existing Netflix and HBO tabs and newly opened tabs', async () => {
  const mock = storageMock();
  const players = [];
  try {
    for (const platform of ['netflix', 'hbo']) players.push(await player(platform, mock));
    for (const { app, video } of players) {
      await video.play();
      app.instance.select(600);
      assert.equal(app.instance.timer.active, true);
    }
    const oldControllers = players.map(({ app }) => app.instance);
    await mock.storage.local.set({ enabled: false });
    for (const { window, app, video, media } of players) {
      assert.equal(app.instance, null);
      assert.equal(window.document.querySelector('[data-sleep-timer]'), null);
      assert.equal(video.paused, false);
      assert.equal(media.pauses, 0);
    }
    for (const controller of oldControllers) {
      assert.equal(controller.started, false);
      assert.equal(controller.timer.active, false);
      assert.equal(controller.guard.enabled, false);
    }
    players.push(await player('netflix', mock));
    assert.equal(players[2].app.instance, null);
    await mock.storage.local.set({ enabled: true });
    for (const { window, app } of players) {
      assert.equal(app.instance.started, true);
      assert.equal(app.instance.timer.active, false);
      assert.equal(window.document.querySelectorAll('[data-sleep-timer]').length, 1);
      window.eval(await read('extension/content.js'));
      assert.equal(window.document.querySelectorAll('[data-sleep-timer]').length, 1);
    }
    assert.equal(mock.listeners.size, 3);
  } finally {
    for (const { window, app } of players) {
      window.dispatchEvent(new window.PageTransitionEvent('pagehide', { persisted: false }));
      app.instance?.destroy();
      await window.happyDOM.close();
    }
    assert.equal(mock.listeners.size, 0);
  }
});

for (const platform of ['netflix', 'hbo']) {
  test(`${platform}: disable releases a stopped guard without resuming the video`, async () => {
    const mock = storageMock();
    const { window, app, video } = await player(platform, mock);
    try {
      await video.play();
      app.instance.select(600);
      app.instance.stop('timer');
      assert.equal(video.paused, true);
      assert.ok(window.document.querySelector('[data-sleep-timer-notice]'));
      await mock.storage.local.set({ enabled: false });
      assert.equal(video.paused, true);
      assert.equal(window.document.querySelector('[data-sleep-timer-notice]'), null);
      await video.play();
      assert.equal(video.paused, false);
      await mock.storage.local.set({ enabled: true });
      assert.equal(app.instance.guard.enabled, false);
    } finally { app.instance?.destroy(); await window.happyDOM.close(); }
  });
}

test('newer storage events win over an in-flight initial settings read', async () => {
  const mock = storageMock();
  let finishRead;
  mock.storage.local.get = () => new Promise((resolve) => { finishRead = resolve; });
  const window = environment('https://unsupported.example/');
  window.chrome.storage = mock.storage;
  try {
    await loadExtension(window);
    const values = [];
    const subscription = window.StreamSleepTimer.settings.observe((value) => values.push(value));
    await mock.storage.local.set({ enabled: false });
    finishRead({ enabled: true });
    await subscription.ready;
    assert.deepEqual(values, [false]);
    subscription.unsubscribe();
    await mock.storage.local.set({ enabled: true });
    assert.deepEqual(values, [false]);
  } finally { await window.happyDOM.close(); }
});

test('settings read failure does not silently enable a player', async () => {
  const mock = storageMock({ enabled: false });
  mock.storage.failRead = true;
  const { window, app } = await player('netflix', mock);
  try {
    assert.equal(app.instance, undefined);
    assert.equal(window.document.querySelector('[data-sleep-timer]'), null);
    mock.storage.failRead = false;
    await mock.storage.local.set({ enabled: true });
    assert.equal(app.instance.started, true);
  } finally { app.instance?.destroy(); await window.happyDOM.close(); }
});

test('popup persists the switch, reopens with saved state, and handles a failed write', async () => {
  const mock = storageMock();
  const window = await popup(mock);
  let reopened;
  try {
    const toggle = window.document.querySelector('#enabled');
    const status = window.document.querySelector('#status');
    assert.equal(status.textContent, 'Açık');
    toggle.click();
    await settle();
    assert.equal(mock.data.enabled, false);
    assert.equal(status.textContent, 'Kapalı');
    reopened = await popup(mock);
    assert.equal(reopened.document.querySelector('#enabled').getAttribute('aria-checked'), 'false');
    mock.storage.failWrite = true;
    toggle.click();
    await settle();
    assert.equal(toggle.disabled, false);
    assert.equal(toggle.getAttribute('aria-checked'), 'false');
    assert.equal(status.textContent, 'Kapalı');
    assert.equal(window.document.querySelector('#error').hidden, false);
    mock.storage.failWrite = false;
    toggle.click();
    await settle();
    assert.equal(status.textContent, 'Açık');
    assert.equal(reopened.document.querySelector('#status').textContent, 'Açık');
    assert.equal(window.document.querySelector('#error').hidden, true);
  } finally {
    for (const page of [window, reopened].filter(Boolean)) {
      page.dispatchEvent(new page.Event('pagehide'));
      await page.happyDOM.close();
    }
    assert.equal(mock.listeners.size, 0);
  }
});

test('popup makes a failed initial read visible without showing an invented state', async () => {
  const mock = storageMock();
  mock.storage.failRead = true;
  const window = await popup(mock);
  try {
    await Promise.resolve();
    assert.equal(window.document.querySelector('#enabled').disabled, true);
    assert.equal(window.document.querySelector('#status').textContent, '…');
    assert.equal(window.document.querySelector('#error').hidden, false);
  } finally { await window.happyDOM.close(); }
});

test('popup preserves links, localizes all 23 languages, and uses the manifest version', async () => {
  for (const locale of locales) {
    const window = await popup(storageMock(), locale);
    try {
      const document = window.document;
      assert.equal(document.documentElement.lang, locale.replace('_', '-'));
      assert.equal(document.documentElement.dir, ['ar', 'fa', 'he', 'ur'].includes(locale) ? 'rtl' : 'ltr');
      assert.equal(document.querySelector('#version').textContent, 'v0.4.2');
      assert.equal(document.querySelectorAll('h2, h3').length, 0);
      assert.equal(document.querySelectorAll('a').length, 3);
      for (const anchor of document.querySelectorAll('a')) {
        assert.match(anchor.href, /^https:\/\/github\.com\/abdullahTaha050\/sleep-timer/);
        assert.equal(anchor.target, '_blank');
        assert.match(anchor.rel, /noopener/);
      }
      for (const node of document.querySelectorAll('[data-i18n]')) assert.ok(node.textContent);
    } finally { await window.happyDOM.close(); }
  }
});
