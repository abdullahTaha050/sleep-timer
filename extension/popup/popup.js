(() => {
  const { i18n, settings } = globalThis.StreamSleepTimer;
  document.documentElement.lang = i18n.language;
  document.documentElement.dir = i18n.direction;
  for (const element of document.querySelectorAll('[data-i18n]')) {
    element.textContent = i18n.t(element.dataset.i18n);
  }
  document.querySelector('#version').textContent = `v${chrome.runtime.getManifest().version}`;
  const toggle = document.querySelector('#enabled');
  const status = document.querySelector('#status');
  const error = document.querySelector('#error');
  let enabled;
  let saving = false;
  const render = (value) => {
    enabled = value;
    toggle.setAttribute('aria-checked', String(value));
    toggle.disabled = saving;
    status.textContent = i18n.t(value ? 'popupEnabled' : 'off');
    error.hidden = true;
  };
  const showError = () => {
    error.textContent = i18n.t('popupStorageError');
    error.hidden = false;
  };
  const subscription = settings.observe(render, showError);
  toggle.addEventListener('click', async () => {
    if (saving || enabled === undefined) return;
    const next = !enabled;
    saving = true;
    toggle.disabled = true;
    error.hidden = true;
    try {
      await settings.setEnabled(next);
      render(next);
    } catch { showError(); }
    finally { saving = false; toggle.disabled = false; }
  });
  window.addEventListener('pagehide', () => subscription.unsubscribe(), { once: true });
})();
