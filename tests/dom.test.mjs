import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment, loadExtension, read } from './helpers/environment.mjs';

test('player integration in a local DOM simulation (no browser or network)', { timeout: 20000 }, async () => {
  const window = environment('https://www.netflix.com/watch/100?test=1');
  try {
    const markup = (await read('tests/player.html')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    window.document.write(markup);
    await loadExtension(window, await read('tests/fixture.js'), await read('tests/integration.js'));
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
