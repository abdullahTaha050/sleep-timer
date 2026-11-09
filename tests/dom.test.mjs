import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';

const read = (relative) => readFile(new URL(relative, import.meta.url), 'utf8');

test('player integration in a local DOM simulation (no browser or network)', { timeout: 20000 }, async () => {
  const window = new Window({ url: 'https://www.netflix.com/watch/100?test=1', settings: {
    disableJavaScriptFileLoading: true,
    disableJavaScriptEvaluation: true,
    disableCSSFileLoading: true,
    disableIframePageLoading: true,
  } });
  try {
    const markup = (await read('player.html')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    window.document.write(markup);
    // Happy DOM has no top-layer renderer. Model open/close state only; real popover
    // painting, positioning, keyboard defaults and fullscreen remain browser QA.
    const open = new WeakSet();
    const nativeMatches = window.HTMLElement.prototype.matches;
    window.HTMLElement.prototype.matches = function(selector) {
      return selector === ':popover-open' ? open.has(this) : nativeMatches.call(this, selector);
    };
    window.HTMLElement.prototype.showPopover = function() {
      open.add(this); this.dispatchEvent(new window.Event('toggle'));
    };
    window.HTMLElement.prototype.hidePopover = function() {
      open.delete(this); this.dispatchEvent(new window.Event('toggle'));
    };
    window.happyDOM.settings.disableJavaScriptEvaluation = false;
    const files = ['../extension/timer.js', '../extension/netflix.js', '../extension/ui.js',
      'fixture.js', '../extension/content.js', 'integration.js'];
    const scripts = await Promise.all(files.map(read));
    window.eval(scripts.join('\n;\n'));
    let report = '';
    const deadline = Date.now() + 16000;
    while (Date.now() < deadline) {
      report = window.document.querySelector('#results').textContent;
      if (report.includes('FAIL') || report.includes('ALL PASSED')) break;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    console.log(report);
    assert.match(report, /ALL PASSED/);
    assert.doesNotMatch(report, /FAIL/);
  } finally { await window.happyDOM.close(); }
});
