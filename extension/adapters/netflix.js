(() => {
  const RIGHT_BUTTONS = [
    'control-next', 'control-episodes', 'control-audio-subtitle',
    'control-speed', 'control-fullscreen-enter', 'control-fullscreen-exit',
  ].map((id) => `button[data-uia="${id}"]`).join(',');

  globalThis.StreamSleepTimer.platforms.register({
    id: 'netflix',
    matches: (location) => location.hostname === 'www.netflix.com',
    getPlaybackKey: ({ location }) => location.pathname.match(/^\/watch\/(\d+)/)?.[1] ?? null,

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
      return { video, mount: group ? { container: group } : null };
    },
  });
})();
