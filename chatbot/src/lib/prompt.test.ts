import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, retrievalQuery } from './prompt.ts';

test('retrievalQuery joins the last two user messages so follow-ups keep their topic', () => {
  assert.equal(retrievalQuery([{ role: 'user', content: 'hotel limit?' }]), 'hotel limit?');
  assert.equal(
    retrievalQuery([
      { role: 'user', content: 'old question' },
      { role: 'assistant', content: 'answer' },
      { role: 'user', content: 'What is the hotel limit?' },
      { role: 'assistant', content: '€180 [1].' },
      { role: 'user', content: 'And in capital cities?' },
    ]),
    'What is the hotel limit?\nAnd in capital cities?',
  );
});

test('buildPrompt with no retrieved chunks tells the model to say it does not know', () => {
  const [system, ...rest] = buildPrompt([{ role: 'user', content: 'Company car?' }], []);
  assert.equal(system.role, 'system');
  assert.match(system.content, /No handbook passages matched/);
  assert.deepEqual(rest, [{ role: 'user', content: 'Company car?' }]);
});
