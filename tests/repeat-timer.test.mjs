import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment, loadExtension, mockMedia, read } from './helpers/environment.mjs';

async function setup(platform) {
  const window = environment(platform === 'netflix'
    ? 'https://www.netflix.com/watch/100' : 'https://www.hbomax.com/video/watch/100');
  window.document.body.innerHTML = platform === 'hbo' ? await read('tests/fixtures/hbo-player.html') : `
    <div data-uia="player" data-videoid="100">
      <div data-uia="video-canvas"><video></video></div>
      <div data-uia="controls-standard"><div><button data-uia="control-next">Next</button></div></div>
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
  const controller = window.StreamSleepTimer.instance;
  window.clearInterval(controller.interval);
  const advance = (ms) => { window.clock += ms; controller.tick(); };
  const expire = (seconds = 300) => { video.play(); controller.select(seconds); advance(seconds * 1000); };
  const repeat = () => controller.notice.continueButton.click();
  return { window, video, controller, advance, expire, repeat,
    close: async () => { controller.destroy(); await window.happyDOM.close(); } };
}

for (const platform of ['netflix', 'hbo']) {
  test(`${platform}: existing blue button repeats the latest full duration across multiple expiries`, async () => {
    const s = await setup(platform);
    try {
      s.video.play(); s.controller.select(600); s.advance(1000);
      s.controller.select(300); s.advance(300000);
      for (let attempt = 0; attempt < 3; attempt++) {
        assert.equal(s.video.paused, true);
        assert.equal(s.controller.notice.continueButton.textContent, '5 dakika daha');
        assert.equal(s.controller.notice.host.shadowRoot.querySelectorAll('button').length, 2);
        s.advance(60000); // Time spent reading the notice is never deducted.
        s.repeat();
        assert.equal(s.controller.notice.panel.matches(':popover-open'), false);
        assert.equal(s.video.paused, false);
        assert.equal(s.controller.timer.remainingMs, 300000);
        assert.equal(s.controller.guard.selection, 300);
        s.advance(1000);
        assert.equal(s.controller.timer.remainingMs, 299000);
        s.video.pause(); s.advance(60000);
        assert.equal(s.controller.timer.remainingMs, 299000);
        s.video.play(); s.advance(299000);
        assert.equal(s.controller.notice.panel.matches(':popover-open'), true);
      }
      s.controller.notice.host.shadowRoot.querySelector('.cancel').click();
      assert.equal(s.controller.timer.active, false);
      assert.equal(s.controller.guard.enabled, false);
      assert.equal(s.video.paused, true);
      assert.equal(s.controller.notice.panel.matches(':popover-open'), false);
    } finally { await s.close(); }
  });

  test(`${platform}: repeat rebinds a replaced player even without normal controls`, async () => {
    const s = await setup(platform);
    try {
      s.expire(5);
      s.window.document.querySelector(platform === 'hbo'
        ? '[data-testid="playback_controls"]' : '[data-uia="controls-standard"]').remove();
      const next = s.video.cloneNode(); mockMedia(s.window, next); s.video.replaceWith(next);
      s.repeat();
      assert.equal(s.controller.media.video, next);
      assert.equal(next.paused, false);
      assert.equal(s.controller.timer.remainingMs, 5000);
      s.advance(5000);
      assert.equal(next.paused, true);
      assert.equal(s.controller.notice.panel.matches(':popover-open'), true);
    } finally { await s.close(); }
  });

  for (const failure of ['throw', 'reject']) {
    test(`${platform}: ${failure} from play keeps the restarted countdown waiting`, async () => {
      const s = await setup(platform);
      try {
        s.expire(5);
        const play = s.video.play;
        s.video.play = () => {
          if (failure === 'throw') throw new Error('Playback blocked');
          return Promise.reject(new Error('Playback blocked'));
        };
        s.repeat(); await Promise.resolve(); s.advance(60000);
        assert.equal(s.controller.timer.remainingMs, 5000);
        assert.equal(s.controller.timer.playing, false);
        assert.equal(s.controller.message, s.window.StreamSleepTimer.config.messages.resumeFailed);
        assert.equal(s.controller.notice.panel.matches(':popover-open'), false);
        s.video.play = play; s.video.play(); s.advance(5000);
        assert.equal(s.video.paused, true);
      } finally { await s.close(); }
    });
  }

  test(`${platform}: a late play rejection cannot overwrite a newer selection`, async () => {
    const s = await setup(platform);
    try {
      s.expire(5);
      let reject;
      s.video.play = () => new Promise((resolve, fail) => { reject = fail; });
      s.repeat(); s.controller.select(30);
      reject(new Error('Old playback request')); await Promise.resolve();
      assert.equal(s.controller.message, '');
      assert.equal(s.controller.timer.remainingMs, 30000);
    } finally { await s.close(); }
  });

  test(`${platform}: leaving the watch page before clicking never restarts old media`, async () => {
    const s = await setup(platform);
    try {
      s.expire(5); s.window.history.pushState({}, '', '/'); s.repeat();
      assert.equal(s.video.paused, true);
      assert.equal(s.controller.timer.active, false);
      assert.equal(s.controller.guard.enabled, false);
    } finally { await s.close(); }
  });

  test(`${platform}: episode stops retain Continue and do not repeat a numeric duration`, async () => {
    const s = await setup(platform);
    try {
      s.video.play(); s.controller.select(300); s.controller.stop('episode');
      assert.equal(s.controller.notice.continueButton.textContent, 'Devam et');
      s.repeat();
      assert.equal(s.video.paused, false);
      assert.equal(s.controller.guard.enabled, false);
      assert.equal(s.controller.timer.active, false);
    } finally { await s.close(); }
  });

  test(`${platform}: a visible episode boundary still stops a repeated timer`, async () => {
    const s = await setup(platform);
    try {
      s.expire(5);
      s.controller.adapter = { ...s.controller.adapter,
        getEpisodeEnd: () => ({ signal: s.video, cancelButton: null }) };
      s.repeat();
      assert.equal(s.video.paused, true);
      assert.equal(s.controller.guard.reason, 'episode');
      assert.equal(s.controller.timer.active, false);
      assert.equal(s.controller.notice.continueButton.textContent, 'Devam et');
    } finally { await s.close(); }
  });
}
