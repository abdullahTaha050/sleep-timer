import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment, loadExtension, mockMedia, read } from './helpers/environment.mjs';

const endCardHTML = await read('tests/fixtures/hbo-episode-end.html');

function endCard(s) {
  const template = s.document.createElement('template');
  template.innerHTML = endCardHTML;
  const card = template.content.firstElementChild;
  const button = card.querySelector('button');
  // Happy DOM does not compute layout; only geometry is stubbed, not visibility rules.
  button.getClientRects = () => [{}];
  s.document.querySelector('[data-testid="up_next"]').replaceWith(card);
  return { card, button };
}

async function setup(url = 'https://www.hbomax.com/video/watch/episode-a') {
  const window = environment(url);
  const document = window.document;
  document.body.innerHTML = await read('tests/fixtures/hbo-player.html');
  const video = document.querySelector('video[data-testid="VideoElement"]');
  const state = mockMedia(window, video);
  const preview = document.querySelector('#preview');
  const previewState = mockMedia(window, preview);
  await loadExtension(window, `
    window.clock = 0;
    const Timer = StreamSleepTimer.PlaybackTimer;
    StreamSleepTimer.PlaybackTimer = class extends Timer {
      constructor(options) { super({ ...options, now: () => window.clock }); }
    };
  `);
  const controller = window.StreamSleepTimer.instance;
  return { window, document, video, state, preview, previewState, controller,
    host: () => document.querySelector('[data-sleep-timer]'),
    advance: (ms) => { window.clock += ms; controller.tick(); },
    close: async () => { controller?.destroy(); await window.happyDOM.close(); } };
}

test('HBO domain and route matching stay limited to the observed origin and watch route', async () => {
  const s = await setup();
  try {
    const adapter = s.controller.adapter;
    assert.equal(adapter.id, 'hbo');
    for (const hostname of ['hbomax.com', 'help.hbomax.com', 'www.hbomax.com.evil.example', 'www.max.com']) {
      assert.equal(adapter.matches({ hostname }), false);
    }
    for (const pathname of ['/home', '/video/watch/', '/video/watch/a/extra', '/other/video/watch/a']) {
      assert.equal(adapter.getPlaybackKey({ location: { pathname } }), null);
    }
    assert.equal(adapter.getPlaybackKey({ location: { pathname: '/video/watch/episode-a/' } }), 'episode-a');
    const manifest = JSON.parse(await read('extension/manifest.json'));
    assert.deepEqual(manifest.content_scripts[0].matches, ['https://www.netflix.com/*', 'https://www.hbomax.com/*']);
  } finally { await s.close(); }
});

test('HBO mounts once before volume in the normal right group, ignoring catchup controls and previews', async () => {
  const s = await setup();
  try {
    assert.equal(s.controller.media.video, s.video);
    assert.equal(s.host().parentElement.className, 'normal-right');
    assert.equal(s.host().previousElementSibling, null);
    assert.equal(s.host().nextElementSibling.dataset.testid, 'volume-container');
    assert.equal(s.controller.root, s.video.parentElement);
    assert.equal(s.host().style.getPropertyValue('--st-icon-size'), '1.5rem');
    for (const button of s.document.querySelectorAll('button')) button.textContent = 'Translated';
    for (const node of s.document.querySelectorAll('[class]')) node.className = 'regenerated';
    s.controller.reconcile();
    s.window.eval(await read('extension/content.js'));
    assert.equal(s.document.querySelectorAll('[data-sleep-timer]').length, 1);
    assert.equal(s.document.querySelector('[data-testid="QuickCatchupOverlay"] [data-sleep-timer]'), null);
  } finally { await s.close(); }
});

test('HBO offers episode end but ignores empty slots and unrecognized next controls', async () => {
  const s = await setup();
  try {
    const ui = s.host().shadowRoot;
    assert.ok(ui.querySelector('input[value="episode"]'));
    for (const seconds of [0, 5, 10, 30, 600, 900, 1200, 1800, 2700, 3600]) {
      assert.ok(ui.querySelector(`input[value="${seconds}"]`));
    }
    s.video.play();
    s.controller.select('episode');
    assert.equal(s.controller.guard.state, 'armed');
    const slot = s.document.querySelector('[data-testid="up_next"]');
    slot.style.visibility = 'visible';
    slot.innerHTML = '<button>Unverified next control</button>';
    let clicks = 0;
    slot.firstChild.addEventListener('click', () => clicks++);
    s.controller.reconcile();
    assert.equal(s.video.paused, false);
    assert.equal(clicks, 0);
    assert.equal(s.controller.guard.state, 'armed');
  } finally { await s.close(); }
});

test('HBO visible end card stops before the file ends and never clicks the next-episode button', async () => {
  const s = await setup();
  try {
    Object.defineProperty(s.video, 'duration', { value: 1200 });
    s.video.currentTime = 1000;
    s.video.play();
    const input = s.host().shadowRoot.querySelector('input[value="episode"]');
    input.checked = true;
    input.dispatchEvent(new s.window.Event('change', { bubbles: true }));
    assert.equal(s.controller.guard.state, 'armed');
    const { button } = endCard(s);
    let clicks = 0;
    button.addEventListener('click', () => { clicks++; s.video.play(); });
    s.controller.reconcile();
    assert.equal(s.controller.guard.reason, 'episode');
    assert.equal(s.video.paused, true);
    assert.equal(s.controller.timer.active, false);
    assert.equal(s.controller.cancelAttempts, 0);
    assert.equal(s.controller.adapter.getEpisodeEnd({ video: s.video }).cancelButton, null);
    assert.match(s.document.querySelector('[data-sleep-timer-notice]').shadowRoot.textContent, /Bölüm sonunda durduruldu/);
    for (let i = 0; i < 5; i++) {
      // Neither a changing countdown nor translated labels define the signal.
      button.setAttribute('aria-label', `Sonraki bölüm ${5 - i}`);
      button.querySelector('[data-testid="player-ux-up-next-timer"]').textContent = String(5 - i);
      s.controller.tick();
    }
    assert.equal(clicks, 0);
    assert.equal(s.controller.guard.reason, 'episode');
  } finally { await s.close(); }
});

test('HBO duration choices are bounded by the end card and still expire first when appropriate', async () => {
  const s = await setup();
  try {
    for (const seconds of [10, 1800]) {
      s.controller.cancel(); s.video.play(); s.controller.select(seconds);
      endCard(s); s.controller.tick();
      assert.equal(s.controller.guard.reason, 'episode');
      assert.equal(s.controller.timer.active, false);
      assert.equal(s.video.paused, true);
      s.document.querySelector('[data-testid="up_next"]').replaceChildren();
    }
    s.controller.cancel(); s.video.play(); s.controller.select(5); s.advance(5000);
    endCard(s); s.controller.reconcile();
    assert.equal(s.controller.guard.reason, 'timer');
    assert.equal(s.video.paused, true);
  } finally { await s.close(); }
});

test('HBO hidden, inert, detached and zero-layout end cards do not stop playback', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    const { card, button } = endCard(s);
    for (const node of [card, button, card.parentElement]) {
      const cases = [
        ['hidden', ''], ['aria-hidden', 'true'], ['inert', ''],
        ['style', 'display:none'], ['style', 'visibility:hidden'],
        ['style', 'visibility:collapse'], ['style', 'opacity:0'],
      ];
      for (const [name, value] of cases) {
        const previous = node.getAttribute(name);
        node.setAttribute(name, value);
        assert.equal(s.controller.adapter.getEpisodeEnd({ video: s.video }), null, `${node.dataset.testid}: ${name}=${value}`);
        s.controller.reconcile();
        assert.equal(s.video.paused, false);
        if (previous === null) node.removeAttribute(name); else node.setAttribute(name, previous);
      }
    }
    button.getClientRects = () => [];
    s.controller.reconcile(); assert.equal(s.video.paused, false);
    button.getClientRects = () => [{}];
    card.remove();
    s.controller.reconcile(); assert.equal(s.video.paused, false);
    assert.equal(s.controller.guard.state, 'armed');
  } finally { await s.close(); }
});

test('HBO only recognizes end controls in the current player and the observed end-card container', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    const { card, button } = endCard(s);
    const otherPlayer = s.document.createElement('div'); otherPlayer.dataset.testid = 'playerContainer';
    s.document.body.append(otherPlayer); otherPlayer.append(card);
    s.controller.reconcile(); assert.equal(s.video.paused, false);
    // Even an identically marked next button outside the up_next card is not a boundary.
    s.document.querySelector('[data-testid="control_footer"]').append(button);
    s.controller.reconcile(); assert.equal(s.video.paused, false);
    assert.equal(s.controller.guard.state, 'armed');
  } finally { await s.close(); }
});

test('HBO arming on an already-visible card stops immediately, even when initially paused', async () => {
  const s = await setup();
  try {
    endCard(s); s.controller.select('episode');
    assert.equal(s.controller.guard.reason, 'episode');
    assert.equal(s.video.paused, true);
    s.video.play(); assert.equal(s.video.paused, true);
  } finally { await s.close(); }
});

test('HBO Off leaves the end card and playback untouched', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode'); s.controller.select(0);
    const { button } = endCard(s); let clicks = 0;
    button.addEventListener('click', () => clicks++);
    s.controller.reconcile(); s.controller.tick();
    assert.equal(s.video.paused, false);
    assert.equal(clicks, 0);
    assert.equal(s.document.querySelector('[data-sleep-timer-notice]'), null);
  } finally { await s.close(); }
});

test('HBO pause guard survives card removal and autoplay of a new video even before its URL changes', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    const { card } = endCard(s); s.controller.reconcile(); card.remove();
    s.video.play(); assert.equal(s.video.paused, true);
    const next = s.document.createElement('video'); next.dataset.testid = 'VideoElement';
    mockMedia(s.window, next); s.video.replaceWith(next); next.play();
    assert.equal(s.controller.media.video, next);
    assert.equal(next.paused, true);
    assert.equal(s.controller.guard.reason, 'episode');
    s.window.history.pushState({}, '', '/video/watch/episode-b'); next.play();
    assert.equal(next.paused, true);
    assert.equal(s.controller.guard.reason, 'episode');
  } finally { await s.close(); }
});

test('HBO end-card notice remains usable without normal controls; Continue releases it', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    s.document.querySelector('[data-testid="playback_controls"]').remove();
    endCard(s); s.controller.reconcile();
    assert.equal(s.host(), null);
    const notice = s.document.querySelector('[data-sleep-timer-notice]');
    assert.equal(notice.parentElement, s.video.parentElement);
    assert.equal(notice.shadowRoot.querySelector('.notice').matches(':popover-open'), true);
    notice.shadowRoot.querySelector('.continue').click(); s.controller.tick();
    assert.equal(s.controller.guard.enabled, false);
    assert.equal(s.video.paused, false);
  } finally { await s.close(); }
});

test('HBO disabling episode protection never starts playback or retriggers on a remaining card', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode'); endCard(s); s.controller.reconcile();
    s.document.querySelector('[data-sleep-timer-notice]').shadowRoot.querySelector('.cancel').click();
    assert.equal(s.video.paused, true);
    assert.equal(s.controller.guard.enabled, false);
    s.video.play(); s.controller.tick(); assert.equal(s.video.paused, false);
  } finally { await s.close(); }
});

test('HBO end-card visibility changes are detected by the observer without waiting for a tick', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    const { card } = endCard(s); card.style.visibility = 'hidden'; s.controller.reconcile();
    s.window.clearInterval(s.controller.interval);
    card.style.visibility = 'visible';
    await new Promise((resolve) => setTimeout(resolve, 150));
    assert.equal(s.video.paused, true);
    assert.equal(s.controller.guard.reason, 'episode');
  } finally { await s.close(); }
});

test('HBO countdown waits on pause, buffering and seeking, then stops only the main video', async () => {
  const s = await setup();
  try {
    s.preview.play(); s.video.play();
    const input = s.host().shadowRoot.querySelector('input[value="10"]');
    input.checked = true;
    input.dispatchEvent(new s.window.Event('change', { bubbles: true }));
    s.advance(2000);
    assert.equal(s.controller.timer.remainingMs, 8000);
    s.video.pause(); s.advance(20000);
    assert.equal(s.controller.timer.remainingMs, 8000);
    s.video.play(); s.advance(1000);
    s.video.dispatchEvent(new s.window.Event('waiting')); s.advance(20000);
    assert.equal(s.controller.timer.remainingMs, 7000);
    s.video.dispatchEvent(new s.window.Event('playing')); s.advance(1000);
    s.state.seeking = true;
    s.video.dispatchEvent(new s.window.Event('seeking')); s.advance(20000);
    assert.equal(s.controller.timer.remainingMs, 6000);
    s.state.seeking = false;
    s.video.dispatchEvent(new s.window.Event('seeked')); s.advance(6000);
    assert.equal(s.controller.guard.reason, 'timer');
    assert.equal(s.video.paused, true);
    assert.equal(s.preview.paused, false);
    assert.equal(s.previewState.pauses, 0);
    s.video.play();
    assert.equal(s.video.paused, true);
  } finally { await s.close(); }
});

test('HBO control rebuilds, hidden controls and query changes preserve the running timer', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(30); s.advance(2000);
    const controls = s.document.querySelector('[data-testid="playback_controls"]');
    controls.style.visibility = 'hidden'; s.controller.reconcile();
    assert.equal(s.host().parentElement.className, 'normal-right');
    const replacement = controls.cloneNode(true);
    replacement.querySelector('[data-sleep-timer]').remove();
    replacement.style.visibility = 'visible'; controls.replaceWith(replacement);
    s.window.history.pushState({}, '', '/video/watch/episode-a?tracking=changed');
    s.controller.reconcile(); s.advance(1000);
    assert.equal(s.controller.timer.remainingMs, 27000);
    assert.equal(s.document.querySelectorAll('[data-sleep-timer]').length, 1);
    assert.ok(replacement.contains(s.host()));
  } finally { await s.close(); }
});

test('HBO missing normal controls never mounts into the hidden catchup footer and still stops', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(5);
    s.document.querySelector('[data-testid="playback_controls"]').remove();
    s.controller.reconcile();
    assert.equal(s.host(), null);
    s.advance(5000);
    assert.equal(s.video.paused, true);
    const notice = s.document.querySelector('[data-sleep-timer-notice]');
    assert.equal(notice.parentElement, s.video.parentElement);
    assert.equal(notice.shadowRoot.querySelector('.notice').matches(':popover-open'), true);
  } finally { await s.close(); }
});

test('HBO media replacement keeps time and detaches old media listeners', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(30); s.advance(2000);
    const next = s.document.createElement('video'); next.dataset.testid = 'VideoElement';
    mockMedia(s.window, next); s.video.replaceWith(next); s.controller.reconcile();
    next.play(); s.video.dispatchEvent(new s.window.Event('pause')); s.advance(1000);
    assert.equal(s.controller.timer.remainingMs, 27000);
    assert.equal(s.controller.media.video, next);
  } finally { await s.close(); }
});

test('HBO watch-route transition stops a new episode on its captured play event', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(600);
    const next = s.document.createElement('video'); next.dataset.testid = 'VideoElement';
    mockMedia(s.window, next); s.video.replaceWith(next);
    s.window.history.pushState({}, '', '/video/watch/episode-b'); next.play();
    assert.equal(s.controller.guard.reason, 'transition');
    assert.equal(s.controller.media.video, next);
    assert.equal(next.paused, true);
  } finally { await s.close(); }
});

test('HBO natural video end arms the shared stop guard before the duration runs out', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(600);
    s.state.ended = true; s.video.dispatchEvent(new s.window.Event('ended'));
    assert.equal(s.controller.guard.reason, 'ended');
    assert.equal(s.controller.timer.active, false);
    assert.equal(s.video.paused, true);
  } finally { await s.close(); }
});

test('HBO Continue plays, while cancel and Off release the guard without starting playback', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(5); s.advance(5000);
    const notice = s.document.querySelector('[data-sleep-timer-notice]').shadowRoot;
    notice.querySelector('.continue').click();
    assert.equal(s.video.paused, false);
    assert.equal(s.controller.guard.enabled, false);
    s.controller.select(5); s.advance(5000);
    notice.querySelector('.cancel').click();
    assert.equal(s.video.paused, true);
    assert.equal(s.controller.guard.enabled, false);
    s.video.play(); s.controller.select(5); s.controller.select(0); s.advance(10000);
    assert.equal(s.video.paused, false);
    assert.equal(s.controller.guard.enabled, false);
  } finally { await s.close(); }
});

test('HBO home route clears the timer even while old player DOM remains', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(10);
    s.window.history.pushState({}, '', '/home'); s.controller.reconcile();
    assert.equal(s.controller.guard.enabled, false);
    assert.equal(s.controller.media.video, null);
    assert.equal(s.host(), null);
    s.advance(20000); assert.equal(s.video.paused, false);
    s.window.history.pushState({}, '', '/video/watch/episode-b'); s.controller.reconcile();
    assert.ok(s.host()); assert.equal(s.controller.guard.enabled, false);
  } finally { await s.close(); }
});

test('HBO never binds unrelated video elements when the main player video is missing', async () => {
  const s = await setup();
  try {
    s.video.remove(); s.controller.reconcile();
    assert.equal(s.controller.media.video, null);
    assert.equal(s.host(), null);
    assert.equal(s.controller.adapter.findPlayer(s.controller.context), null);
  } finally { await s.close(); }
});
