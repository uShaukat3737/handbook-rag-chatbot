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
