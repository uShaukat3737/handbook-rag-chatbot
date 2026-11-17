import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunkMarkdown } from './chunk.ts';

test('chunkMarkdown returns no chunks for empty or whitespace-only input', () => {
  assert.deepEqual(chunkMarkdown('', 'empty.md'), []);
  assert.deepEqual(chunkMarkdown('  \n\n  ', 'blank.md'), []);
});
