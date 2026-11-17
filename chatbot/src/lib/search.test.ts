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

test('searchChunks ranks by BM25, ignores case and punctuation, and caps results at k', () => {
  const chunks = [
    chunk('hours', 'Core hours are 10:00 to 15:00. Hours are flexible.'),
    chunk('leave', 'You get 27 days of annual leave. Leave carries over.'),
    chunk('sick', 'Sick leave: self-certify for 3 days.'),
    chunk('hotel', 'The hotel limit is 180 per night.'),
  ];
  const ids = (query: string, k: number) => searchChunks(chunks, query, k).map((c) => c.id);
  assert.deepEqual(ids('How much ANNUAL leave?', 4), ['leave', 'sick']);
  assert.deepEqual(ids('annual leave', 1), ['leave']);
  assert.deepEqual(ids('hotel limit', 0), []);
});
