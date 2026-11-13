import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment, read } from './helpers/environment.mjs';

async function setup(t) {
  const window = environment('https://www.netflix.com/watch/100');
  const sources = await Promise.all([
    'extension/shared/i18n.js',
    'extension/shared/build.js',
    'extension/shared/config.js', 'extension/ui/styles.js', 'extension/ui/timer-ui.js',
  ].map(read));
  window.happyDOM.settings.disableJavaScriptEvaluation = false;
  window.eval(sources.join('\n;\n'));
  const selections = [];
  const ui = new window.StreamSleepTimer.TimerUI((value) => selections.push(value));
  const player = window.document.createElement('div');
  const video = window.document.createElement('video');
  const outside = window.document.createElement('button');
  player.append(video);
  window.document.body.append(player, outside);
  ui.mount({ container: player });
  t.after(async () => { ui.destroy(); await window.happyDOM.close(); });
  return { window, ui, player, video, outside, selections };
}

const sequence = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
function clickSequence(window, target) {
  return sequence.map((type) => {
    const EventClass = type.startsWith('pointer') ? window.PointerEvent : window.MouseEvent;
    const event = new EventClass(type, { bubbles: true, composed: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  });
}

test('outside dismissal consumes the whole first click; the next click reaches the player', async (t) => {
  const { window, ui, player, video } = await setup(t);
  ui.button.click();
  assert.equal(ui.isOpen(), true);
  const received = [];
  let playing = true;
  for (const name of sequence) {
    player.addEventListener(name, (event) => received.push(event.type), true);
  }
  video.addEventListener('click', () => { playing = !playing; });
  assert.ok(clickSequence(window, video).every((event) => event.defaultPrevented));
  assert.equal(ui.isOpen(), false);
  assert.equal(ui.button.getAttribute('aria-expanded'), 'false');
  assert.deepEqual(received, []);
  assert.equal(playing, true);
  assert.ok(clickSequence(window, video).every((event) => !event.defaultPrevented));
  assert.deepEqual(received, sequence);
  assert.equal(playing, false);
});

test('a click outside the player dismisses without activating its target', async (t) => {
  const { window, ui, outside } = await setup(t);
  let clicks = 0;
  outside.addEventListener('click', () => clicks++);
  ui.button.click();
  clickSequence(window, outside);
  assert.equal(ui.isOpen(), false);
  assert.equal(clicks, 0);
  clickSequence(window, outside);
  assert.equal(clicks, 1);
});

test('menu interaction and trigger toggling are not mistaken for outside clicks', async (t) => {
  const { window, ui, selections } = await setup(t);
  ui.button.click();
  const summary = ui.host.shadowRoot.querySelector('summary');
  assert.ok(clickSequence(window, summary).every((event) => !event.defaultPrevented));
  assert.equal(ui.isOpen(), true);
  const input = ui.inputs.find((item) => item.value === '600');
  input.checked = true;
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.deepEqual(selections, [600]);
  assert.equal(ui.isOpen(), false);
  clickSequence(window, ui.button);
  assert.equal(ui.isOpen(), true);
  clickSequence(window, ui.button);
  assert.equal(ui.isOpen(), false);
});

test('Escape dismisses with focus restored even when focus is outside the menu', async (t) => {
  const { window, ui, outside } = await setup(t);
  ui.button.click();
  outside.focus();
  const escape = new window.KeyboardEvent('keydown', {
    key: 'Escape', bubbles: true, composed: true, cancelable: true,
  });
  outside.dispatchEvent(escape);
  assert.equal(escape.defaultPrevented, true);
  assert.equal(ui.isOpen(), false);
  assert.equal(ui.host.shadowRoot.activeElement, ui.button);
  assert.ok(clickSequence(window, outside).every((event) => !event.defaultPrevented));
});

test('destroying an open menu leaves page interactions available', async (t) => {
  const { window, ui, video } = await setup(t);
  ui.button.click();
  ui.destroy();
  assert.ok(clickSequence(window, video).every((event) => !event.defaultPrevented));
});
