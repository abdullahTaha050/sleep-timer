(() => {
  const PLAYER = '[data-testid="playerContainer"]';
  const VIDEO = 'video[data-testid="VideoElement"]';
  const RIGHT_BUTTONS = [
    'player-ux-volume-button', 'player-ux-track-selector-button', 'player-ux-fullscreen-button',
  ].map((id) => `button[data-testid="${id}"]`).join(',');

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
    id: 'hbo',
    matches: (location) => location.hostname === 'www.hbomax.com',
    getPlaybackKey: ({ location }) => location.pathname.match(/^\/video\/watch\/([a-zA-Z0-9-]+)\/?$/)?.[1] ?? null,
    // HBO uses a smaller control scale than Netflix. Keep shared UI sizes unchanged.
    appearance: { iconSize: '1.5rem', controlSize: '2.75rem', controlPadding: '.625rem' },

    findPlayer({ document }) {
      const player = [...document.querySelectorAll(PLAYER)].find((node) => node.querySelector(VIDEO));
      if (!player) return null;
      const video = player.querySelector(VIDEO);
      // QuickCatchupOverlay contains another footer, even during normal playback.
      // Scope to the observed playback controls, not every footer in the player.
      const footer = player.querySelector('[data-testid="playback_controls"] [data-testid="control_footer"]');
      const anchor = footer?.querySelector(RIGHT_BUTTONS);
      let group = anchor?.parentElement;
      while (group && group !== footer) {
        if (group.querySelectorAll(RIGHT_BUTTONS).length >= 2 &&
            !group.querySelector('button[data-testid="player-ux-play-pause-button"]')) break;
        group = group.parentElement;
      }
      if (group === footer) group = null;
      return { video, root: player, mount: group ? { container: group } : null };
    },
    getEpisodeEnd({ video }) {
      const player = video?.closest(PLAYER);
      // The slot also exists while empty/hidden during playback. Require the
      // observed end-card structure inside this video's player, not a generic Next button.
      const buttons = player?.querySelectorAll(
        '[data-testid="up_next"] [data-testid="player-ux-up-next-container"] button[data-testid="player-ux-up-next-button"]',
      ) ?? [];
      const signal = [...buttons].find(visible);
      // This button STARTS the next episode. The supplied autoplay-off card has
      // no cancellation control, so rely on the shared pause guard and never click it.
      return signal ? { signal, cancelButton: null } : null;
    },
  });
})();
