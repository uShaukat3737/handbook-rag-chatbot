import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunkMarkdown } from './chunk.ts';

test('chunkMarkdown returns no chunks for empty or whitespace-only input', () => {
  assert.deepEqual(chunkMarkdown('', 'empty.md'), []);
  assert.deepEqual(chunkMarkdown('  \n\n  ', 'blank.md'), []);
});

test('chunkMarkdown splits on ## headings and prefixes each chunk with its heading path', () => {
  const doc = '# Leave\n\nIntro.\n\n## Sick leave\n\nTell your manager.\n\n### Notes\n\nSelf-certify.\n\n## Annual\n\n27 days.';
  assert.deepEqual(chunkMarkdown(doc, 'leave.md'), [
    { id: 'leave.md#0', source: 'leave.md', heading: 'Leave', text: 'Leave\nIntro.' },
    {
      id: 'leave.md#1',
      source: 'leave.md',
      heading: 'Leave > Sick leave',
      text: 'Leave > Sick leave\nTell your manager.\n\n### Notes\n\nSelf-certify.',
    },
    { id: 'leave.md#2', source: 'leave.md', heading: 'Leave > Annual', text: 'Leave > Annual\n27 days.' },
  ]);
});
