import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { catalogs, locales, environment, loadExtension, read } from './helpers/environment.mjs';
import { createI18n } from './helpers/i18n.mjs';

const run = promisify(execFile);

test('release ZIP omits test controls while local and source builds retain them', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'sleep-timer-package-'));
  const localBuild = await read('extension/shared/build.js');
  try {
    await cp(new URL('../extension', import.meta.url), join(directory, 'extension'), { recursive: true });
    await mkdir(join(directory, 'scripts'));
    await cp(new URL('../scripts/package.py', import.meta.url), join(directory, 'scripts/package.py'));
    await mkdir(join(directory, 'node_modules'));
    await writeFile(join(directory, 'node_modules', 'excluded.txt'), 'Test dependency');
    await run('python3', [join(directory, 'scripts/package.py')]);
    const { stdout } = await run('python3', ['-c', `
import json
from pathlib import Path
from zipfile import ZipFile
root = Path.cwd()
version = json.loads((root / 'extension/manifest.json').read_text())['version']
with ZipFile(root / 'dist' / f'sleep-timer-extension-{version}.zip') as archive:
    manifest = json.loads(archive.read('manifest.json'))
    result = {'files': archive.namelist(), 'scripts': [archive.read(name).decode() for name in manifest['content_scripts'][0]['js']]}
    result['catalogs'] = {name.split('/')[1]: json.loads(archive.read(name)) for name in archive.namelist() if name.startswith('_locales/') and name.endswith('/messages.json')}
with ZipFile(root / 'dist' / f'sleep-timer-source-{version}.zip') as archive:
    result['sourceFiles'] = archive.namelist()
    result['sourceBuild'] = archive.read('sleep-timer/extension/shared/build.js').decode()
print(json.dumps(result))
    `], { cwd: directory });
    const packaged = JSON.parse(stdout);
    assert.equal(packaged.sourceBuild, localBuild);
    assert.equal(await readFile(join(directory, 'extension/shared/build.js'), 'utf8'), localBuild);
    assert.ok(packaged.files.every((file) => !file.startsWith('node_modules/')));
    assert.ok(packaged.sourceFiles.every((file) => !file.includes('/node_modules/')));
    assert.deepEqual(packaged.catalogs, catalogs);

    for (const locale of locales) {
      for (const release of [false, true]) {
        const window = environment('https://unsupported.example/', locale);
        let ui;
        try {
          if (release) {
            window.chrome.i18n = createI18n(locale, packaged.catalogs);
            window.happyDOM.settings.disableJavaScriptEvaluation = false;
            window.eval(packaged.scripts.join('\n;\n'));
          } else await loadExtension(window);
          const app = window.StreamSleepTimer;
          assert.deepEqual(Array.from(app.config.testSeconds), release ? [] : [5, 10, 30]);
          let selection;
          ui = new app.TimerUI((value) => { selection = value; }, { episodeEnd: true });
          ui.mount({ container: window.document.body });
          const shadow = ui.host.shadowRoot;
          assert.equal(shadow.querySelector('h2').textContent, catalogs[locale].timerName.message);
          assert.equal(ui.host.lang, locale.replace('_', '-'));
          assert.equal(ui.host.dir, ['ar', 'fa', 'he', 'ur'].includes(locale) ? 'rtl' : 'ltr');
          assert.equal(shadow.querySelectorAll('input').length, release ? 8 : 11);
          assert.equal(Boolean(shadow.querySelector('.testing')), !release);
          for (const seconds of [5, 10, 30]) {
            assert.equal(Boolean(shadow.querySelector(`input[value="${seconds}"]`)), !release);
          }
          ui.button.click();
          assert.equal(ui.isOpen(), true);
          const duration = shadow.querySelector('input[value="600"]');
          duration.checked = true;
          duration.dispatchEvent(new window.Event('change', { bubbles: true }));
          assert.equal(selection, 600);
          assert.equal(ui.isOpen(), false);
          assert.ok(shadow.querySelector('input[value="episode"]'));
        } finally { ui?.destroy(); await window.happyDOM.close(); }
      }
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
