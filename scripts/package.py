"""Create extension-only and source archives without dependencies or personal data."""
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'extension/manifest.json').read_text())
version = manifest['version']
dist = root / 'dist'
dist.mkdir(exist_ok=True)
extension_files = ['manifest.json', *manifest['icons'].values()]
for script in manifest['content_scripts']:
    extension_files.extend(script.get('js', []))
    extension_files.extend(script.get('css', []))
for relative in extension_files:
    if not (root / 'extension' / relative).is_file():
        raise SystemExit(f'Missing extension file: {relative}')
with ZipFile(dist / f'sleep-timer-extension-{version}.zip', 'w', ZIP_DEFLATED) as archive:
    for file in sorted((root / 'extension').rglob('*')):
        if file.is_file() and not file.name.startswith('.'):
            relative = file.relative_to(root / 'extension')
            if relative.as_posix() == 'shared/build.js':
                archive.writestr(str(relative),
                    '// Release build: test controls are disabled.\n'
                    'globalThis.StreamSleepTimer ??= {};\n'
                    'globalThis.StreamSleepTimer.build = Object.freeze({ testDurations: false });\n')
            else:
                archive.write(file, relative)
with ZipFile(dist / f'sleep-timer-source-{version}.zip', 'w', ZIP_DEFLATED) as archive:
    for file in sorted(root.rglob('*')):
        relative = file.relative_to(root)
        if any(part in ('node_modules', 'dist', '.git', '__pycache__') for part in relative.parts):
            continue
        if file.is_file() and file.name != '.DS_Store':
            archive.write(file, Path('sleep-timer') / relative)
print(f'Packaged version {version} into {dist}')
