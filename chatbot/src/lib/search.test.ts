import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchChunks } from './search.ts';
import type { Chunk } from './chunk.ts';

const chunk = (id: string, text: string): Chunk => ({ id, source: `${id}.md`, heading: id, text });

test('searchChunks returns nothing for an empty index, a blank query, or no matching terms', () => {
  const chunks = [chunk('leave', 'annual leave is 27 days')];
  assert.deepEqual(searchChunks([], 'annual leave', 4), []);
  assert.deepEqual(searchChunks(chunks, '   ?! ', 4), []);
  assert.deepEqual(searchChunks(chunks, 'company car', 4), []);
});
