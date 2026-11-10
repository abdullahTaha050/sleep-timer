(() => {
  const RIGHT_BUTTONS = [
    'control-next', 'control-episodes', 'control-audio-subtitle',
    'control-speed', 'control-fullscreen-enter', 'control-fullscreen-exit',
  ].map((id) => `button[data-uia="${id}"]`).join(',');

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
    id: 'netflix',
    matches: (location) => location.hostname === 'www.netflix.com',
    getPlaybackKey: ({ location, document }) => {
      const route = location.pathname.match(/^\/watch\/(\d+)/)?.[1];
      if (!route) return null;
      const playerID = document.querySelector('[data-uia="player"]')?.getAttribute('data-videoid');
      return `${route}:${playerID || route}`;
    },

    findPlayer({ document }) {
      const players = [...document.querySelectorAll('[data-uia="player"]')];
      const player = players.find((node) => node.querySelector('[data-uia="video-canvas"] video'));
      if (!player) return null;
      const video = player.querySelector('[data-uia="video-canvas"] video');
      const controls = player.querySelector('[data-uia="controls-standard"]');
      const anchor = controls?.querySelector(RIGHT_BUTTONS);
      let group = anchor?.parentElement;
      // Use semantic controls, never Netflix's generated class names or translated labels.
      while (group && group !== controls) {
        const buttons = group.querySelectorAll(RIGHT_BUTTONS);
        if (buttons.length >= 2 && !group.querySelector('[data-uia^="control-play-pause"]')) break;
        group = group.parentElement;
      }
      if (group === controls) group = null;
      // Normal controls may disappear while the seamless next-episode card is shown.
      const credits = player.querySelector('button[data-uia="watch-credits-seamless-button"]');
      const fallback = visible(credits) ? credits.parentElement : null;
      return { video, root: player, mount: group ? { container: group } : fallback ? { container: fallback } : null };
    },

    getEpisodeEnd({ video }) {
      const player = video?.closest('[data-uia="player"]');
      const next = player?.querySelector('button[data-uia="next-episode-seamless-button-draining"]');
      const credits = player?.querySelector('button[data-uia="watch-credits-seamless-button"]');
      // Only the observed end-of-episode UI, never the ordinary control-next button.
      const signal = visible(next) ? next : visible(credits) ? credits : null;
      if (!signal) return null;
      return { signal, cancelButton: visible(credits) && !credits.disabled ? credits : null };
    },

    cancelAutoplay({ signal, cancelButton }) {
      if (!visible(signal) || !visible(cancelButton) || cancelButton.disabled) return false;
      // Inferred from the supplied "Watch credits" control. Live Netflix verification is required.
      cancelButton.click();
      return true; // Means click attempted, not proof Netflix cancelled its internal countdown.
    },
  });
})();
