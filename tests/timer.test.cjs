const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PlaybackTimer } = require('../extension/core/timer.js');

function setup() {
  let time = 0;
  let expirations = 0;
  const timer = new PlaybackTimer({ now: () => time, onExpire: () => expirations++ });
  return { timer, advance: (ms) => { time += ms; }, expired: () => expirations };
}

test('only elapsed playing time counts across pause and resume', () => {
  const { timer, advance, expired } = setup();
  timer.start(10);
  advance(60000);
  timer.tick();
  assert.equal(timer.remainingMs, 10000);
  timer.setPlaying(true);
  advance(3500);
  timer.setPlaying(false);
  assert.equal(timer.remainingMs, 6500);
  advance(60000);
  timer.tick();
  assert.equal(timer.remainingMs, 6500);
  timer.setPlaying(true);
  advance(6500);
  timer.tick();
  assert.equal(expired(), 1);
  assert.equal(timer.active, false);
});

test('delayed ticks account for full elapsed playback and expire once', () => {
  const { timer, advance, expired } = setup();
  timer.setPlaying(true);
  timer.start(5);
  advance(8000);
  timer.tick();
  advance(1000);
  timer.tick();
  assert.equal(timer.remainingMs, 0);
  assert.equal(expired(), 1);
});

test('choosing a different duration starts a fresh countdown', () => {
  const { timer, advance, expired } = setup();
  timer.setPlaying(true);
  timer.start(5);
  advance(4000);
  timer.start(10);
  advance(1000);
  timer.tick();
  assert.equal(timer.remainingMs, 9000);
  assert.equal(expired(), 0);
});

test('cancel removes deadline and never calls expiry', () => {
  const { timer, advance, expired } = setup();
  timer.setPlaying(true);
  timer.start(5);
  timer.cancel();
  advance(10000);
  timer.tick();
  assert.equal(expired(), 0);
  assert.equal(timer.snapshot().durationMs, 0);
});

test('buffering or seeking can suspend countdown without changing remaining duration', () => {
  const { timer, advance } = setup();
  timer.setPlaying(true);
  timer.start(30);
  advance(1200);
  timer.setPlaying(false);
  advance(20000);
  timer.setPlaying(true);
  advance(800);
  timer.tick();
  assert.equal(timer.remainingMs, 28000);
});

test('pause at deadline invokes expiry once even with reentrant pause callbacks', () => {
  let time = 0;
  let calls = 0;
  const timer = new PlaybackTimer({ now: () => time, onExpire() {
    calls++;
    timer.setPlaying(false);
  } });
  timer.start(5);
  timer.setPlaying(true);
  time = 5000;
  timer.setPlaying(false);
  assert.equal(calls, 1);
  assert.equal(timer.playing, false);
});

test('new timer after expiration can run again', () => {
  const { timer, advance, expired } = setup();
  timer.setPlaying(true);
  timer.start(5);
  advance(5000);
  timer.tick();
  timer.start(5);
  advance(5000);
  timer.tick();
  assert.equal(expired(), 2);
});

test('rejects invalid duration values', () => {
  const { timer } = setup();
  for (const value of [-1, 0, NaN, Infinity, '5']) assert.throws(() => timer.start(value), RangeError);
});
