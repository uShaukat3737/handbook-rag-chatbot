import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleChat } from './chat.ts';
import type { Chunk } from './chunk.ts';

const chunks: Chunk[] = [
  { id: 'leave#1', source: 'leave-policy.md', heading: 'Leave > Annual', text: 'Leave > Annual\nYou get 27 days of annual leave.' },
  { id: 'hotel#2', source: 'expenses-and-travel.md', heading: 'Expenses > Hotels', text: 'Expenses > Hotels\nHotel limit is €180.' },
];
const noLog = () => {};

test('handleChat returns 400 for an invalid request without calling the LLM', async () => {
  let called = false;
  const complete = async () => {
    called = true;
    return '';
  };
  const result = await handleChat({ messages: [] }, { chunks, complete, logError: noLog });
  assert.equal(result.status, 400);
  assert.ok('error' in result.body);
  assert.equal(called, false);
});

test('handleChat returns a generic 502 and logs when the LLM fails, without leaking internals', async () => {
  const logged: string[] = [];
  const complete = async (): Promise<string> => {
    throw new Error('401 invalid api key gsk_secret');
  };
  const result = await handleChat(
    { messages: [{ role: 'user', content: 'annual leave?' }] },
    { chunks, complete, logError: (event) => logged.push(event) },
  );
  assert.equal(result.status, 502);
  assert.doesNotMatch(JSON.stringify(result.body), /gsk_secret|401|invalid api key/);
  assert.deepEqual(logged, ['llm_request_failed']);
});

test('handleChat sends retrieved passages to the LLM and returns the answer with numbered sources', async () => {
  let prompt = '';
  const complete = async (messages: { content: string }[]) => {
    prompt = messages[0].content;
    return 'You get 27 days [1].';
  };
  const result = await handleChat(
    { messages: [{ role: 'user', content: 'How much annual leave?' }] },
    { chunks, complete, logError: noLog },
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, {
    answer: 'You get 27 days [1].',
    sources: [{ n: 1, source: 'leave-policy.md', heading: 'Leave > Annual', text: chunks[0].text }],
  });
  assert.match(prompt, /\[1\] \(leave-policy\.md\)/);
});

test('handleChat normalizes full-width citation brackets like 【1】 to [1]', async () => {
  const result = await handleChat(
    { messages: [{ role: 'user', content: 'How much annual leave?' }] },
    { chunks, complete: async () => 'You get 27 days【1】.', logError: noLog },
  );
  assert.equal((result.body as { answer: string }).answer, 'You get 27 days [1].');
});

test('handleChat returns a friendly 429 when the LLM provider is out of tokens or rate limited', async () => {
  const logged: string[] = [];
  const complete = async (): Promise<string> => {
    throw Object.assign(new Error('Rate limit reached for model on tokens per minute (TPM)'), { status: 429 });
  };
  const result = await handleChat(
    { messages: [{ role: 'user', content: 'annual leave?' }] },
    { chunks, complete, logError: (event) => logged.push(event) },
  );
  assert.equal(result.status, 429);
  assert.match((result.body as { error: string }).error, /usage limit/i);
  assert.doesNotMatch(JSON.stringify(result.body), /TPM/);
  assert.deepEqual(logged, ['llm_rate_limited']);
});

test('handleChat returns only the sources the answer actually cites', async () => {
  const both = { messages: [{ role: 'user', content: 'annual leave and hotel limit?' }] };
  const cited = await handleChat(both, { chunks, complete: async () => 'Hotels cap at €180 [2].', logError: noLog });
  assert.deepEqual((cited.body as { sources: { n: number }[] }).sources.map((s) => s.n), [2]);
  const none = await handleChat(both, { chunks, complete: async () => "I don't know.", logError: noLog });
  assert.deepEqual((none.body as { sources: unknown[] }).sources, []);
});
