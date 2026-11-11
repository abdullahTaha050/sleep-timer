(async () => {
  const { installDemoI18n } = await import('./helpers/i18n.mjs');
  await installDemoI18n();
  // The fixture uses the same load order as the packaged extension.
  const manifest = await fetch('/extension/manifest.json').then((response) => response.json());
  const load = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.append(script);
  });
  for (const file of manifest.content_scripts[0].js) {
    if (file === 'content.js') await load('/tests/fixture.js');
    await load(`/extension/${file}`);
  }
  await load('/tests/integration.js');
})().catch((error) => { document.querySelector('#results').textContent = `Fixture yüklenemedi: ${error}`; });
