import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment, loadExtension, mockMedia, read } from './helpers/environment.mjs';

const firstPath = '/-/tr/detail/EXAMPLE00000000000000000001';
const nextPath = '/-/tr/detail/EXAMPLE00000000000000000002';
const endCardHTML = await read('tests/fixtures/amazon-episode-end.html');

function endCard(s) {
  const template = s.document.createElement('template');
  template.innerHTML = endCardHTML;
  const card = template.content.firstElementChild;
  const signal = card.querySelector('.atvwebplayersdk-nextupcard-button');
  // Happy DOM has no layout engine: stub geometry, retain real visibility logic.
  signal.getClientRects = () => [{}];
  s.document.querySelector('#dv-web-player .atvwebplayersdk-nextupcard-wrapper').replaceWith(card);
  return { card, signal, shown: card.querySelector('.atvwebplayersdk-nextupcard-show'),
    hide: card.querySelector('.atvwebplayersdk-nextupcardhide-button') };
}

async function setup(url = `https://www.primevideo.com${firstPath}`) {
  const window = environment(url);
  const document = window.document;
  document.body.innerHTML = await read('tests/fixtures/amazon-player.html');
  const video = document.querySelector('.atvwebplayersdk-video-surface video');
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

test('Prime Video origin matching excludes Amazon stores and unrelated subdomains', async () => {
  const s = await setup();
  try {
    assert.equal(s.controller.adapter.id, 'prime-video');
    assert.equal(s.controller.adapter.matches({ hostname: 'www.primevideo.com' }), true);
    for (const hostname of ['primevideo.com', 'help.primevideo.com', 'www.primevideo.com.evil.example', 'www.amazon.com', 'www.amazon.com.tr']) {
      assert.equal(s.controller.adapter.matches({ hostname }), false, hostname);
    }
  } finally { await s.close(); }
});

test('Prime Video only binds the main video inside the observed video surface', async () => {
  const s = await setup();
  try {
    assert.equal(s.controller.media.video, s.video);
    assert.equal(s.controller.root, s.document.querySelector('#dv-web-player'));
    const decoy = s.document.createElement('video');
    s.document.querySelector('.atvwebplayersdk-player-container').prepend(decoy);
    s.video.remove(); s.controller.reconcile();
    assert.equal(s.controller.media.video, null);
    assert.equal(s.host(), null);
  } finally { await s.close(); }
});

test('Prime Video mounts once before subtitles in the native right group and offers duration controls', async () => {
  const s = await setup();
  try {
    for (let i = 0; i < 3; i++) s.controller.reconcile();
    const host = s.host();
    assert.equal(s.document.querySelectorAll('[data-sleep-timer]').length, 1);
    assert.equal(host.parentElement.className, 'right-controls');
    assert.equal(host.previousElementSibling, null);
    assert.equal(host.nextElementSibling.querySelector('button').id, 'atvwebplayersdk-captions-toggle-button');
    assert.equal(host.style.getPropertyValue('--st-icon-size'), '1.5rem');
    assert.ok(host.shadowRoot.querySelector('input[value="episode"]'));
    host.shadowRoot.querySelector('button').click();
    const duration = host.shadowRoot.querySelector('input[value="10"]');
    duration.checked = true;
    duration.dispatchEvent(new s.window.Event('change', { bubbles: true }));
    assert.equal(s.controller.guard.selection, 10);
  } finally { await s.close(); }
});

test('Prime Video missing controls preserve the timer and remount once when restored', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(30); s.advance(2000);
    const group = s.document.querySelector('.right-controls');
    const parent = group.parentElement;
    group.remove(); s.controller.reconcile(); s.advance(1000);
    assert.equal(s.host(), null);
    assert.equal(s.controller.timer.remainingMs, 27000);
    parent.append(group); s.controller.reconcile();
    assert.equal(s.document.querySelectorAll('[data-sleep-timer]').length, 1);
    assert.equal(s.host().parentElement, group);
  } finally { await s.close(); }
});

test('Prime Video never mounts in a broad group containing close or playback controls', async () => {
  const s = await setup();
  try {
    const group = s.document.querySelector('.right-controls');
    for (const id of ['atvwebplayersdk-close-player-button', 'atvwebplayersdk-play-pause-button',
      'atvwebplayersdk-skip-backward-button', 'atvwebplayersdk-skip-forward-button']) {
      const button = s.document.createElement('button'); button.id = id;
      group.append(button); s.controller.reconcile();
      assert.equal(s.host(), null, id);
      assert.equal(s.controller.media.video, s.video);
      button.remove(); s.controller.reconcile();
      assert.ok(s.host());
    }
    const fullscreen = group.querySelector('#atvwebplayersdk-fullscreen-toggle-button');
    s.document.querySelector('.atvwebplayersdk-player-container').append(fullscreen);
    s.controller.reconcile();
    assert.equal(s.host(), null);
  } finally { await s.close(); }
});

test('Prime Video localized detail routes use the title ID without depending on tracking or labels', async () => {
  const s = await setup();
  try {
    const key = s.controller.key;
    s.video.play(); s.controller.select(30); s.advance(2000);
    for (const pathname of ['/detail/EXAMPLE00000000000000000001', '/-/en/detail/EXAMPLE00000000000000000001/']) {
      s.window.history.pushState({}, '', `${pathname}?ref_=changed#player`);
      s.document.querySelector('.atvwebplayersdk-player-container').setAttribute('aria-label', 'Translated');
      s.controller.reconcile();
      assert.equal(s.controller.key, key);
      assert.equal(s.controller.guard.state, 'armed');
      assert.equal(s.controller.timer.remainingMs, 28000);
    }
  } finally { await s.close(); }
});

test('Prime Video temporary media absence keeps the session until a replacement arrives', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(30); s.advance(2000);
    const surface = s.document.querySelector('.atvwebplayersdk-video-surface');
    s.video.remove(); s.controller.reconcile(); s.advance(10000);
    assert.equal(s.controller.guard.state, 'armed');
    assert.equal(s.controller.timer.remainingMs, 28000);
    const next = s.document.createElement('video'); mockMedia(s.window, next);
    surface.append(next); s.controller.reconcile(); next.play(); s.advance(1000);
    assert.equal(s.controller.timer.remainingMs, 27000);
    assert.equal(s.controller.media.video, next);
  } finally { await s.close(); }
});

test('Prime Video cannot infer episode end from empty cards or translated next buttons', async () => {
  const s = await setup();
  try {
    assert.equal(s.controller.adapter.getEpisodeEnd({ video: s.video }), null);
    assert.equal(s.controller.adapter.cancelAutoplay, undefined);
    s.video.play(); s.controller.select('episode');
    assert.equal(s.controller.guard.state, 'armed');
    s.controller.select(600);
    const card = s.document.querySelector('.atvwebplayersdk-nextupcard-wrapper');
    card.innerHTML = '<button>Next episode</button>';
    let clicks = 0;
    card.firstElementChild.addEventListener('click', () => clicks++);
    s.controller.reconcile(); s.advance(1000);
    assert.equal(s.video.paused, false);
    assert.equal(s.controller.timer.remainingMs, 599000);
    assert.equal(clicks, 0);
    assert.equal(s.controller.guard.state, 'armed');
  } finally { await s.close(); }
});

test('Prime Video episode selection stops on the shown end card without clicking next or Hide', async () => {
  const s = await setup();
  try {
    s.video.play(); s.preview.play();
    const option = s.host().shadowRoot.querySelector('input[value="episode"]');
    option.checked = true; option.dispatchEvent(new s.window.Event('change', { bubbles: true }));
    assert.equal(s.controller.guard.selection, 'episode');
    const { card, signal, hide } = endCard(s);
    signal.textContent = 'Başka bir dil'; hide.textContent = '別の言語';
    let clicks = 0;
    card.addEventListener('click', () => clicks++);
    assert.equal(s.controller.adapter.getEpisodeEnd({ video: s.video }).cancelButton, null);
    s.controller.reconcile();
    assert.equal(s.controller.guard.reason, 'episode');
    assert.equal(s.video.paused, true);
    assert.equal(s.preview.paused, false);
    assert.equal(s.controller.timer.active, false);
    s.video.play(); s.advance(1000);
    assert.equal(s.video.paused, true);
    assert.equal(clicks, 0);
  } finally { await s.close(); }
});

test('Prime Video end card caps a minute countdown before its deadline', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(600); s.advance(1000);
    assert.equal(s.controller.timer.remainingMs, 599000);
    endCard(s); s.controller.tick();
    assert.equal(s.controller.guard.reason, 'episode');
    assert.equal(s.video.paused, true);
    assert.equal(s.controller.repeatSeconds, 0);
  } finally { await s.close(); }
});

test('Prime Video ignores hidden end cards, ancestors and cards without geometry', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    const { card, signal } = endCard(s);
    const variants = [
      ['hidden', ''], ['aria-hidden', 'true'], ['inert', ''],
      ['style', 'display:none'], ['style', 'visibility:hidden'],
      ['style', 'visibility:collapse'], ['style', 'opacity:0'],
    ];
    for (const node of [signal, card, card.parentElement]) {
      for (const [attribute, value] of variants) {
        node.setAttribute(attribute, value); s.controller.reconcile();
        assert.equal(s.controller.guard.state, 'armed', `${node.className}: ${attribute}=${value}`);
        assert.equal(s.video.paused, false);
        node.removeAttribute(attribute);
      }
    }
    signal.getClientRects = () => [];
    s.controller.reconcile(); assert.equal(s.controller.guard.state, 'armed');
    signal.getClientRects = () => [{}];
    s.controller.reconcile(); assert.equal(s.controller.guard.reason, 'episode');
  } finally { await s.close(); }
});

test('Prime Video requires the shown marker and a next-content target in the current player', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    const { card, signal, shown } = endCard(s);
    shown.classList.remove('atvwebplayersdk-nextupcard-show');
    s.controller.reconcile(); assert.equal(s.controller.guard.state, 'armed');
    shown.classList.add('atvwebplayersdk-nextupcard-show');
    signal.remove(); s.controller.reconcile(); assert.equal(s.controller.guard.state, 'armed');
    shown.append(signal);
    s.document.body.append(card); s.controller.reconcile();
    assert.equal(s.controller.guard.state, 'armed');
    assert.equal(s.controller.adapter.getEpisodeEnd({ video: s.preview }), null);
    const other = s.document.createElement('div'); other.id = 'dv-web-player';
    other.append(card); s.document.body.append(other); s.controller.reconcile();
    assert.equal(s.controller.guard.state, 'armed');
  } finally { await s.close(); }
});

test('Prime Video shown-marker mutation stops playback even with native controls removed', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    const { shown } = endCard(s);
    shown.classList.remove('atvwebplayersdk-nextupcard-show');
    s.document.querySelector('.right-controls').remove(); s.controller.reconcile();
    assert.equal(s.host(), null);
    s.window.clearInterval(s.controller.interval);
    shown.classList.add('atvwebplayersdk-nextupcard-show');
    await new Promise((resolve) => setTimeout(resolve, 150));
    assert.equal(s.video.paused, true);
    assert.equal(s.controller.guard.reason, 'episode');
    assert.equal(s.document.querySelector('[data-sleep-timer-notice]').parentElement.id, 'dv-web-player');
  } finally { await s.close(); }
});

test('Prime Video arming with a visible end card stops immediately while Off leaves it untouched', async () => {
  const s = await setup();
  try {
    s.video.play(); endCard(s); s.controller.reconcile();
    assert.equal(s.video.paused, false);
    s.controller.select('episode'); assert.equal(s.video.paused, true);
    s.controller.select(0); s.video.play(); s.controller.tick();
    assert.equal(s.video.paused, false);
    assert.equal(s.controller.guard.enabled, false);
  } finally { await s.close(); }
});

test('Prime Video episode guard survives card removal, video replacement and same-URL autoplay', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode');
    const { card } = endCard(s); s.controller.reconcile(); card.remove();
    const replacement = s.document.createElement('video'); mockMedia(s.window, replacement);
    s.video.replaceWith(replacement); replacement.play();
    assert.equal(replacement.paused, true);
    assert.equal(s.controller.guard.reason, 'episode');
    s.document.querySelector('[data-sleep-timer-notice]').shadowRoot.querySelector('.continue').click();
    assert.equal(replacement.paused, false);
    assert.equal(s.controller.guard.enabled, false);
    assert.equal(s.controller.timer.active, false);
  } finally { await s.close(); }
});

test('Prime Video Continue releases a visible episode card without repeating the selected duration', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(600); endCard(s); s.controller.reconcile();
    s.document.querySelector('[data-sleep-timer-notice]').shadowRoot.querySelector('.continue').click();
    s.advance(1000);
    assert.equal(s.video.paused, false);
    assert.equal(s.controller.timer.active, false);
    assert.equal(s.controller.guard.enabled, false);
  } finally { await s.close(); }
});

test('Prime Video cancelling an episode stop releases the guard without playing', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select('episode'); endCard(s); s.controller.reconcile();
    s.document.querySelector('[data-sleep-timer-notice]').shadowRoot.querySelector('.cancel').click();
    assert.equal(s.video.paused, true);
    assert.equal(s.controller.guard.enabled, false);
    s.video.play(); s.controller.tick(); assert.equal(s.video.paused, false);
  } finally { await s.close(); }
});

test('Prime Video episode card also bounds a repeated timer', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(5); s.advance(5000);
    endCard(s);
    s.document.querySelector('[data-sleep-timer-notice]').shadowRoot.querySelector('.continue').click();
    assert.equal(s.controller.guard.reason, 'episode');
    assert.equal(s.video.paused, true);
    assert.equal(s.controller.timer.active, false);
  } finally { await s.close(); }
});

test('Prime Video countdown waits during pause, buffering and seeking and pauses only the main video', async () => {
  const s = await setup();
  try {
    s.preview.play(); s.video.play(); s.controller.select(10); s.advance(2000);
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
    s.video.play(); assert.equal(s.video.paused, true);
  } finally { await s.close(); }
});

test('Prime Video hidden and rebuilt player controls and tracking queries preserve elapsed time', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(30); s.advance(2000);
    const controls = s.document.querySelector('.atvwebplayersdk-player-container');
    controls.style.visibility = 'hidden'; s.controller.reconcile();
    const replacement = controls.cloneNode(true);
    replacement.querySelectorAll('[data-sleep-timer]').forEach((node) => node.remove());
    controls.replaceWith(replacement);
    s.window.history.pushState({}, '', `${firstPath}?ref_=changed`);
    s.controller.reconcile(); s.advance(1000);
    assert.equal(s.controller.timer.remainingMs, 27000);
    assert.equal(s.controller.guard.state, 'armed');
    assert.ok(s.document.querySelectorAll('[data-sleep-timer]').length <= 1);
  } finally { await s.close(); }
});

test('Prime Video media replacement preserves time and detaches stale media listeners', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(30); s.advance(2000);
    const next = s.document.createElement('video');
    mockMedia(s.window, next); s.video.replaceWith(next); s.controller.reconcile();
    next.play(); s.video.dispatchEvent(new s.window.Event('pause')); s.advance(1000);
    assert.equal(s.controller.timer.remainingMs, 27000);
    assert.equal(s.controller.media.video, next);
  } finally { await s.close(); }
});

test('Prime Video title route changes hold the replacement video before its captured play event completes', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(600);
    const next = s.document.createElement('video');
    mockMedia(s.window, next); s.video.replaceWith(next);
    s.window.history.pushState({}, '', nextPath); next.play();
    assert.equal(s.controller.guard.reason, 'transition');
    assert.equal(s.controller.media.video, next);
    assert.equal(next.paused, true);
  } finally { await s.close(); }
});

test('Prime Video natural end activates the shared guard and holds replacement media at the same URL', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(600);
    s.state.ended = true; s.video.dispatchEvent(new s.window.Event('ended'));
    assert.equal(s.controller.guard.reason, 'ended');
    assert.equal(s.controller.timer.active, false);
    const next = s.document.createElement('video');
    mockMedia(s.window, next); s.video.replaceWith(next); next.play();
    assert.equal(s.controller.media.video, next);
    assert.equal(next.paused, true);
    s.document.querySelector('[data-sleep-timer-notice]').shadowRoot.querySelector('.continue').click();
    assert.equal(next.paused, false);
    assert.equal(s.controller.guard.enabled, false);
  } finally { await s.close(); }
});

test('Prime Video expiry notice repeats the full duration and cancel never starts playback', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(5); s.advance(5000);
    const notice = s.document.querySelector('[data-sleep-timer-notice]');
    assert.equal(notice.parentElement, s.document.querySelector('#dv-web-player'));
    notice.shadowRoot.querySelector('.continue').click();
    assert.equal(s.video.paused, false);
    assert.equal(s.controller.timer.remainingMs, 5000);
    s.advance(5000); notice.shadowRoot.querySelector('.cancel').click();
    assert.equal(s.video.paused, true);
    assert.equal(s.controller.guard.enabled, false);
    s.video.play(); s.controller.select(5); s.controller.select(0); s.advance(10000);
    assert.equal(s.video.paused, false);
    assert.equal(s.controller.guard.enabled, false);
  } finally { await s.close(); }
});

test('Prime Video closing the player clears its timer while the detail URL remains', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(10);
    s.document.querySelector('#dv-web-player').remove(); s.controller.reconcile();
    assert.equal(s.controller.guard.enabled, false);
    assert.equal(s.controller.media.video, null);
    assert.equal(s.host(), null);
    s.advance(20000); assert.equal(s.video.paused, false);
  } finally { await s.close(); }
});

test('Prime Video unsupported routes clear timers even with stale player DOM', async () => {
  const s = await setup();
  try {
    for (const pathname of ['/storefront/home', '/detail/', '/detail/example/extra', '/other/detail/example']) {
      s.window.history.pushState({}, '', firstPath); s.controller.reconcile();
      s.video.play(); s.controller.select(10);
      s.window.history.pushState({}, '', pathname); s.controller.reconcile();
      assert.equal(s.controller.guard.enabled, false, pathname);
      assert.equal(s.controller.media.video, null, pathname);
      assert.equal(s.host(), null, pathname);
    }
  } finally { await s.close(); }
});

test('Prime Video pagehide clears timers and media subscriptions', async () => {
  const s = await setup();
  try {
    s.video.play(); s.controller.select(10);
    s.window.dispatchEvent(new s.window.Event('pagehide'));
    assert.equal(s.controller.guard.enabled, false);
    assert.equal(s.controller.timer.active, false);
    assert.equal(s.controller.media.video, null);
    assert.equal(s.host(), null);
    assert.equal(s.controller.started, false);
  } finally { await s.close(); }
});
