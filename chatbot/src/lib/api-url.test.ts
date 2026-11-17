import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiBaseUrl } from './api-url.ts';

test('apiBaseUrl prefers the configured URL, then same-origin on web, then the dev server host', () => {
  assert.equal(apiBaseUrl({ os: 'ios', envUrl: 'https://chat.example.dev/', hostUri: '192.168.1.5:8081' }), 'https://chat.example.dev');
  assert.equal(apiBaseUrl({ os: 'web', hostUri: '192.168.1.5:8081' }), '');
  assert.equal(apiBaseUrl({ os: 'android', hostUri: '192.168.1.5:8081' }), 'http://192.168.1.5:8081');
  assert.equal(apiBaseUrl({ os: 'ios' }), '', 'no host known: fall back to relative');
});
