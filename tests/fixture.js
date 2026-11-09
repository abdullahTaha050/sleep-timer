const testMode = new URLSearchParams(location.search).has('test');
const media = document.querySelector('video');
const playButton = document.querySelector('[data-uia^="control-play-pause"]');
const results = document.querySelector('#results');
window.fixture = { clock: 0, pauses: 0 };
if (location.hostname === '127.0.0.1' || location.hostname === 'localhost') {
  const netflix = StreamSleepTimer.platforms.resolve({ hostname: 'www.netflix.com' });
  StreamSleepTimer.platforms.register({ ...netflix, id: 'local-demo', matches: (location) => ['127.0.0.1', 'localhost'].includes(location.hostname) });
}
if (testMode) {
  const OriginalTimer = StreamSleepTimer.PlaybackTimer;
  StreamSleepTimer.PlaybackTimer = class extends OriginalTimer {
    constructor(options) { super({ ...options, now: () => fixture.clock }); }
  };
  const state = { paused: true, ended: false, seeking: false, readyState: 4 };
  for (const property of Object.keys(state)) Object.defineProperty(media, property, { get: () => state[property] });
  media.pause = () => { fixture.pauses++; state.paused = true; media.dispatchEvent(new Event('pause')); };
  media.play = async () => { state.paused = false; media.dispatchEvent(new Event('playing')); };
  fixture.state = state;
} else {
  // A local, synthetic MediaStream exercises real HTMLMediaElement play/pause events.
  const canvas = document.createElement('canvas');
  canvas.width = 960; canvas.height = 540;
  const ctx = canvas.getContext('2d');
  setInterval(() => {
    const g = ctx.createLinearGradient(0, 0, 960, 540);
    g.addColorStop(0, '#13364c'); g.addColorStop(1, '#5a6a50');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 540);
    ctx.fillStyle = '#ffffff50'; ctx.beginPath();
    ctx.arc(650 + Math.sin(performance.now() / 3000) * 35, 180, 80, 0, 2 * Math.PI); ctx.fill();
  }, 100);
  media.srcObject = canvas.captureStream(10);
}
playButton.addEventListener('click', () => media.paused ? media.play() : media.pause());
for (const event of ['pause', 'playing']) media.addEventListener(event, () => {
  playButton.textContent = media.paused ? '▶' : 'Ⅱ';
  playButton.dataset.uia = media.paused ? 'control-play-pause-play' : 'control-play-pause-pause';
  playButton.setAttribute('aria-label', media.paused ? 'Oynat' : 'Duraklat');
});
document.querySelector('[data-uia="control-fullscreen-enter"]').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.querySelector('[data-uia="player"]').requestFullscreen();
});
document.querySelector('#run').addEventListener('click', () => location.href = '/watch/100?test=1');
