import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from './rate-limit.ts';

test('rate limiter blocks a key after the limit and resets after the window', () => {
  let now = 0;
  const allow = createRateLimiter({ limit: 2, windowMs: 1000, now: () => now });
  assert.equal(allow('a'), true);
  assert.equal(allow('a'), true);
  assert.equal(allow('a'), false);
  assert.equal(allow('b'), true, 'other keys have their own budget');
  now = 1000;
  assert.equal(allow('a'), true, 'new window');
});
