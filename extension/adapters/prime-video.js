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
      // Controls may disappear while playback continues. The empty next-up
      // slot in both supplied snapshots is not an episode-end signal.
      return { video, root: player, mount: group ? { container: group } : null };
    },
  });
})();
