(() => {
  const PLAYER = '#dv-web-player';
  const SURFACE = '.atvwebplayersdk-video-surface';
  const RIGHT_BUTTONS = [
    'atvwebplayersdk-captions-toggle-button',
    'atvwebplayersdk-mute-toggle-button',
    'atvwebplayersdk-fullscreen-toggle-button',
  ].map((id) => `button#${id}`);
  const OTHER_BUTTONS = [
    'atvwebplayersdk-close-player-button',
    'atvwebplayersdk-play-pause-button',
    'atvwebplayersdk-skip-backward-button',
    'atvwebplayersdk-skip-forward-button',
  ].map((id) => `button#${id}`).join(',');

  function visible(element) {
    if (!element?.isConnected || !element.getClientRects().length) return false;
    for (let node = element; node; node = node.parentElement) {
      if (node.hidden || node.getAttribute('aria-hidden') === 'true' || node.hasAttribute('inert')) return false;
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.opacity === '0') return false;
    }
    return true;
  }

  globalThis.StreamSleepTimer.platforms.register({
    id: 'prime-video',
    matches: (location) => location.hostname === 'www.primevideo.com',
    getPlaybackKey({ document, location }) {
      const title = location.pathname.match(/^\/(?:-\/[a-z]{2}(?:-[a-zA-Z]{2})?\/)?detail\/([a-zA-Z0-9]+)\/?$/)?.[1];
      // Prime plays in an overlay on its detail page. The route alone would
      // keep an armed timer alive after the player is closed. Keep the key
      // through transient video/control replacement, but clear it on closure.
      if (!title || !document.querySelector(`${PLAYER} ${SURFACE}`)) return null;
      return title;
    },
    appearance: { iconSize: '1.5rem', controlSize: '2.75rem', controlPadding: '.625rem' },

    findPlayer({ document }) {
      const player = document.querySelector(PLAYER);
      const video = player?.querySelector(`${SURFACE} video`);
      if (!video) return null;
      const controls = player.querySelector('.atvwebplayersdk-player-container');
      const buttons = RIGHT_BUTTONS.map((selector) => controls?.querySelector(selector));
      let group = buttons.every(Boolean) ? buttons[0].parentElement : null;
      // Captions and volume have differently nested wrappers. Find their
      // shared right group without relying on generated CSS classes.
      while (group && group !== controls) {
        if (buttons.every((button) => group.contains(button))) break;
        group = group.parentElement;
      }
      if (group === controls || group?.querySelector(OTHER_BUTTONS)) group = null;
      // Controls may disappear while playback continues.
      return { video, root: player, mount: group ? { container: group } : null };
    },
    getEpisodeEnd({ video }) {
      const player = video?.closest(PLAYER);
      // The empty slot persists during normal playback. Require the observed
      // shown card and its next-content target, scoped to this video's player.
      const cards = player?.querySelectorAll(
        '.atvwebplayersdk-nextupcard-wrapper .atvwebplayersdk-nextupcard-show .atvwebplayersdk-nextupcard-button',
      ) ?? [];
      const signal = [...cards].find(visible);
      // The card starts the next content; "Hide" is not proven to cancel
      // autoplay. Click neither and let the shared pause guard hold playback.
      return signal ? { signal, cancelButton: null } : null;
    },
  });
})();
