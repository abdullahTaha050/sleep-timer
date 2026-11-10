import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';

const base = new URL('../../', import.meta.url);
export const read = (relative) => readFile(new URL(relative, base), 'utf8');

export function environment(url) {
  const window = new Window({ url, settings: {
    disableJavaScriptFileLoading: true,
    disableJavaScriptEvaluation: true,
    disableCSSFileLoading: true,
    disableIframePageLoading: true,
  } });
  // No layout engine: only model popover state, not browser painting or focus defaults.
  const open = new WeakSet();
  const matches = window.HTMLElement.prototype.matches;
  window.HTMLElement.prototype.matches = function(selector) {
    return selector === ':popover-open' ? open.has(this) : matches.call(this, selector);
  };
  window.HTMLElement.prototype.showPopover = function() { open.add(this); this.dispatchEvent(new window.Event('toggle')); };
  window.HTMLElement.prototype.hidePopover = function() { open.delete(this); this.dispatchEvent(new window.Event('toggle')); };
  return window;
}

export async function loadExtension(window, beforeBootstrap = '', afterBootstrap = '') {
  const manifest = JSON.parse(await read('extension/manifest.json'));
  const files = await Promise.all(manifest.content_scripts[0].js.map(async (file) => {
    const source = await read(`extension/${file}`);
    return file === 'content.js' ? `${beforeBootstrap}\n;\n${source}` : source;
  }));
  window.happyDOM.settings.disableJavaScriptEvaluation = false;
  window.eval(`${files.join('\n;\n')}\n;\n${afterBootstrap}`);
}

export function mockMedia(window, video) {
  const state = { paused: true, ended: false, seeking: false, readyState: 4, pauses: 0 };
  for (const property of ['paused', 'ended', 'seeking', 'readyState']) {
    Object.defineProperty(video, property, { get: () => state[property] });
  }
  video.play = () => {
    state.paused = false;
    video.dispatchEvent(new window.Event('play'));
    video.dispatchEvent(new window.Event('playing'));
    return Promise.resolve();
  };
  video.pause = () => { state.pauses++; state.paused = true; video.dispatchEvent(new window.Event('pause')); };
  return state;
}
