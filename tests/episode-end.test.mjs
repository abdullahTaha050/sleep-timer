import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment, loadExtension, mockMedia } from './helpers/environment.mjs';

async function setup() {
  const window = environment('https://www.netflix.com/watch/100');
  window.document.body.innerHTML = `<div data-uia="player" data-videoid="100">
    <div data-uia="video-canvas"><video></video></div>
    <div data-uia="controls-standard"><div class="right"><div><button data-uia="control-next">Next</button></div><div><button data-uia="control-speed">Speed</button></div></div></div>
  </div>`;
  const video = window.document.querySelector('video');
  const state = mockMedia(window, video);
  await loadExtension(window, `
    window.clock = 0;
    const Timer = StreamSleepTimer.PlaybackTimer;
    StreamSleepTimer.PlaybackTimer = class extends Timer {
      constructor(options) { super({ ...options, now: () => window.clock }); }
    };
  `);
  const controller = window.StreamSleepTimer.instance;
  return { window, video, state, controller, close: async () => { controller.destroy(); await window.happyDOM.close(); } };
}

function card(window, { credits = true, draining = true, hidden = false } = {}) {
  const element = window.document.createElement('div');
  element.className = 'SeamlessControls--container SeamlessControls--container-visible';
  element.hidden = hidden;
  if (credits) element.innerHTML += '<button data-uia="watch-credits-seamless-button">Jeneriği İzle</button>';
  if (draining) element.innerHTML += '<button data-uia="next-episode-seamless-button-draining"><div style="transition: transform 5s linear"></div>Sonraki Bölüm</button>';
  // Explicit geometry stub for this DOM-only test. Actual visibility still checks ancestors/CSS.
  for (const button of element.querySelectorAll('button')) button.getClientRects = () => [{}];
  window.document.querySelector('[data-uia="player"]').append(element);
  return element;
}

test('regular Next Episode control and hidden end cards never trigger a stop', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode'); s.controller.tick();
    assert.equal(s.controller.guard.state, 'armed');
    const end = card(s.window, { hidden: true });
    s.controller.reconcile(); assert.equal(s.video.paused, false);
    end.hidden = false; end.style.display = 'none';
    s.controller.reconcile(); assert.equal(s.video.paused, false);
    end.style.display = ''; end.setAttribute('aria-hidden', 'true');
    s.controller.reconcile(); assert.equal(s.video.paused, false);
  } finally { await s.close(); }
});

test('end card stops early in credits and Watch Credits is clicked only once', async () => {
  const s = await setup();
  try {
    Object.defineProperty(s.video, 'duration', { value: 1200 });
    s.video.currentTime = 1020; // Three minutes remain: no fixed last-seconds heuristic.
    s.video.play(); s.controller.select('episode');
    const end = card(s.window);
    let clicks = 0;
    end.querySelector('[data-uia="watch-credits-seamless-button"]').addEventListener('click', () => {
      clicks++;
      s.video.play(); // Cancel UI may resume playback. Guard must already be active.
    });
    s.controller.reconcile();
    assert.equal(clicks, 1);
    assert.equal(s.video.paused, true);
    assert.equal(s.controller.guard.reason, 'episode');
    s.controller.tick(); s.controller.reconcile();
    assert.equal(clicks, 1);
    assert.match(s.window.document.querySelector('[data-sleep-timer-notice]').shadowRoot.textContent, /Bölüm sonunda durduruldu/);
  } finally { await s.close(); }
});

test('minute timer is bounded by episode end rather than the full file duration', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(1800);
    card(s.window); s.controller.tick();
    assert.equal(s.controller.timer.active, false);
    assert.equal(s.controller.guard.reason, 'episode');
    assert.equal(s.video.paused, true);
  } finally { await s.close(); }
});

test('Off leaves the Netflix end card and playback untouched', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(0);
    const end = card(s.window); let clicks = 0;
    end.querySelector('button').addEventListener('click', () => clicks++);
    s.controller.reconcile(); s.controller.tick();
    assert.equal(s.video.paused, false); assert.equal(clicks, 0);
    assert.equal(s.window.document.querySelector('[data-sleep-timer-notice]'), null);
  } finally { await s.close(); }
});

test('arming with an already-visible end card stops immediately, including credits-only UI', async () => {
  const s = await setup();
  try {
    s.video.play(); card(s.window, { draining: false }); s.controller.select('episode');
    assert.equal(s.video.paused, true);
    assert.equal(s.controller.guard.reason, 'episode');
  } finally { await s.close(); }
});

test('missing cancel control still pauses; next-video autoplay is stopped on capture play', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    card(s.window, { credits: false }); s.controller.reconcile();
    assert.equal(s.video.paused, true); assert.equal(s.controller.cancelAttempts, 0);
    const next = s.window.document.createElement('video'); mockMedia(s.window, next);
    s.video.replaceWith(next);
    s.window.history.pushState({}, '', '/watch/200');
    next.play(); // No explicit reconcile: capture handler must bind and stop this new video.
    assert.equal(next.paused, true);
    assert.equal(s.controller.guard.stopped, true);
    assert.equal(s.controller.media.video, next);
  } finally { await s.close(); }
});

test('an unexpected episode change is stopped even if no end-card signal was observed', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(600);
    s.window.document.querySelector('[data-uia="player"]').setAttribute('data-videoid', '200');
    s.controller.tick(); // Player identity changed before URL.
    assert.equal(s.controller.guard.reason, 'transition');
    assert.equal(s.video.paused, true);
  } finally { await s.close(); }
});

test('the stop notice works without normal controls and explicit Continue releases protection', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    s.window.document.querySelector('[data-uia="controls-standard"]').remove();
    const end = card(s.window);
    end.querySelector('button').addEventListener('click', () => end.remove());
    s.controller.reconcile();
    const notice = s.window.document.querySelector('[data-sleep-timer-notice]').shadowRoot;
    assert.equal(notice.querySelector('.notice').matches(':popover-open'), true);
    s.video.play(); assert.equal(s.video.paused, true);
    notice.querySelector('.continue').click();
    assert.equal(s.controller.guard.enabled, false);
    assert.equal(s.video.paused, false);
    assert.equal(notice.querySelector('.notice').matches(':popover-open'), false);
  } finally { await s.close(); }
});

test('turning protection off does not start playback', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode'); card(s.window); s.controller.reconcile();
    s.window.document.querySelector('[data-sleep-timer-notice]').shadowRoot.querySelector('.cancel').click();
    assert.equal(s.controller.guard.enabled, false); assert.equal(s.video.paused, true);
    s.video.play(); assert.equal(s.video.paused, false);
  } finally { await s.close(); }
});

test('natural ended event is the fallback when the end-card UI is absent', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    s.state.ended = true; s.video.dispatchEvent(new s.window.Event('ended'));
    assert.equal(s.controller.guard.reason, 'ended');
    assert.equal(s.controller.guard.stopped, true);
  } finally { await s.close(); }
});

test('hidden-to-visible attribute changes trigger end-card detection without polling', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    const end = card(s.window, { hidden: true }); s.controller.reconcile();
    // Stop the periodic timer so this test specifically exercises the MutationObserver.
    s.window.clearInterval(s.controller.interval);
    end.hidden = false;
    await new Promise((resolve) => setTimeout(resolve, 150));
    assert.equal(s.controller.guard.reason, 'episode'); assert.equal(s.video.paused, true);
  } finally { await s.close(); }
});

test('cancel attempts are bounded across repeated rebuilt cards; pause protection persists', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode'); let clicks = 0;
    for (let i = 0; i < 5; i++) {
      const end = card(s.window);
      end.querySelector('button').addEventListener('click', () => clicks++);
      s.controller.reconcile(); end.remove();
    }
    assert.equal(clicks, 3);
    s.video.play(); assert.equal(s.video.paused, true);
  } finally { await s.close(); }
});

test('leaving the watch page releases protection and clears notice', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode'); card(s.window); s.controller.reconcile();
    s.window.history.pushState({}, '', '/browse'); s.controller.reconcile();
    assert.equal(s.controller.guard.enabled, false);
    assert.equal(s.window.document.querySelector('[data-sleep-timer]'), null);
    assert.equal(s.window.document.querySelector('[data-sleep-timer-notice]').shadowRoot.querySelector('.notice').matches(':popover-open'), false);
  } finally { await s.close(); }
});
