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

test('buildPrompt numbers retrieved chunks so the model can cite them as [n]', () => {
  const chunks = [
    { id: 'a#0', source: 'leave-policy.md', heading: 'Leave', text: 'Leave\n27 days.' },
    { id: 'b#1', source: 'expenses-and-travel.md', heading: 'Hotels', text: 'Hotels\n€180.' },
  ];
  const [system] = buildPrompt([{ role: 'user', content: 'q' }], chunks);
  assert.match(system.content, /\[1\] \(leave-policy\.md\)\nLeave\n27 days\./);
  assert.match(system.content, /\[2\] \(expenses-and-travel\.md\)\nHotels\n€180\./);
  assert.match(system.content, /Cite the passages/);
});
