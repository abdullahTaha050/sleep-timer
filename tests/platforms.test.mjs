import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment, loadExtension, mockMedia, read } from './helpers/environment.mjs';

test('unsupported domains never start the player controller', async () => {
  const window = environment('https://unsupported.example/watch/100');
  try {
    await loadExtension(window);
    assert.equal(window.StreamSleepTimer.instance, undefined);
    assert.equal(window.document.querySelector('[data-sleep-timer]'), null);
  } finally { await window.happyDOM.close(); }
});

test('registry rejects duplicate and incomplete adapters', async () => {
  const window = environment('https://unsupported.example/');
  try {
    await loadExtension(window);
    const registry = window.StreamSleepTimer.platforms;
    assert.throws(() => registry.register({ id: 'incomplete' }), /adapter needs/);
    assert.throws(() => registry.register(registry.resolve({ hostname: 'www.netflix.com' })), /Duplicate platform/);
  } finally { await window.happyDOM.close(); }
});

test('a second platform reuses the whole controller with its own identity, DOM, placement and pause action', async () => {
  const window = environment('https://cinema.example/view?id=alpha');
  try {
    const document = window.document;
    document.body.innerHTML = '<main><video></video><nav class="tools"><button class="first">A</button><button class="last">B</button></nav></main>';
    let video = document.querySelector('video');
    mockMedia(window, video);
    await loadExtension(window, `
      window.clock = 0;
      window.pauseCalls = 0;
      const Timer = StreamSleepTimer.PlaybackTimer;
      StreamSleepTimer.PlaybackTimer = class extends Timer {
        constructor(options) { super({ ...options, now: () => window.clock }); }
      };
      StreamSleepTimer.platforms.register({
        id: 'test-cinema',
        matches: (location) => location.hostname === 'cinema.example',
        getPlaybackKey: ({ location }) => location.pathname === '/view' ? new URLSearchParams(location.search).get('id') : null,
        findPlayer: ({ document }) => {
          const video = document.querySelector('video');
          const container = document.querySelector('.tools');
          return video ? { video, mount: container ? { container, before: container.querySelector('.last') } : null } : null;
        },
        pause: (video) => { window.pauseCalls++; video.pause(); return video.paused; },
        appearance: { iconSize: '2rem', controlSize: '3rem' },
      });
    `);
    const app = window.StreamSleepTimer;
    const controller = app.instance;
    const host = () => document.querySelector('[data-sleep-timer]');
    const ui = () => host().shadowRoot;
    const choose = (seconds) => {
      const input = ui().querySelector(`input[value="${seconds}"]`);
      input.checked = true;
      input.dispatchEvent(new window.Event('change', { bubbles: true }));
    };
    assert.equal(controller.adapter.id, 'test-cinema');
    assert.equal(host().previousElementSibling.className, 'first');
    assert.equal(host().nextElementSibling.className, 'last');
    assert.equal(host().style.getPropertyValue('--st-icon-size'), '2rem');
    choose(10);
    video.play(); window.clock += 3000; controller.tick();
    assert.equal(controller.timer.remainingMs, 7000);
    video.pause(); window.clock += 9000; controller.tick();
    assert.equal(controller.timer.remainingMs, 7000);
    video.play();
    // Replacing the media node preserves the timer for the same identity, and unbinds old listeners.
    const oldVideo = video;
    video = document.createElement('video'); mockMedia(window, video);
    oldVideo.replaceWith(video); controller.reconcile();
    video.play(); oldVideo.dispatchEvent(new window.Event('pause'));
    window.clock += 1000; controller.tick();
    assert.equal(controller.timer.remainingMs, 6000);
    // A temporarily missing player suspends without losing remaining time.
    video.remove(); controller.reconcile();
    window.clock += 50000; controller.tick();
    assert.equal(controller.timer.remainingMs, 6000);
    document.querySelector('main').prepend(video); controller.reconcile();
    window.clock += 6000; controller.tick();
    assert.equal(video.paused, true);
    assert.equal(window.pauseCalls, 1);
    assert.match(ui().querySelector('.status').textContent, /Süre doldu/);
    // Query-string identity changes reset even though the pathname is unchanged.
    choose(30);
    window.history.pushState({}, '', '/view?id=beta'); controller.tick();
    assert.equal(controller.timer.active, false);
    // Double bootstrap must not add a second controller or button.
    window.eval(await read('extension/content.js'));
    assert.equal(app.instance, controller);
    assert.equal(document.querySelectorAll('[data-sleep-timer]').length, 1);
    // Permanent cleanup removes listeners, even if the old video later plays again.
    controller.destroy(); video.play();
    assert.equal(controller.timer.playing, false);
    assert.equal(host(), null);
  } finally { await window.happyDOM.close(); }
});

test('episode-end detection and cancellation also work through a non-Netflix adapter', async () => {
  const window = environment('https://cinema.example/view');
  try {
    window.document.body.innerHTML = '<main><video></video><nav></nav></main>';
    const video = window.document.querySelector('video');
    mockMedia(window, video);
    await loadExtension(window, `
      StreamSleepTimer.platforms.register({
        id: 'cinema-end',
        matches: (location) => location.hostname === 'cinema.example',
        getPlaybackKey: () => 'episode-a',
        findPlayer: ({ document }) => ({ video: document.querySelector('video'),
          root: document.querySelector('main'), mount: { container: document.querySelector('nav') } }),
        getEpisodeEnd: ({ document }) => {
          const signal = document.querySelector('.up-next');
          return signal ? { signal, cancelButton: signal } : null;
        },
        cancelAutoplay: ({ cancelButton }) => { cancelButton.click(); return true; },
      });
    `);
    const controller = window.StreamSleepTimer.instance;
    video.play(); controller.select('episode');
    const next = window.document.createElement('button'); next.className = 'up-next';
    let cancelled = 0;
    next.addEventListener('click', () => { cancelled++; next.remove(); });
    window.document.querySelector('main').append(next);
    controller.reconcile();
    assert.equal(cancelled, 1);
    assert.equal(video.paused, true);
    assert.equal(controller.guard.reason, 'episode');
    controller.destroy();
  } finally { await window.happyDOM.close(); }
});
