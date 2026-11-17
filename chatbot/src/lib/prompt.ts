import type { ChatMessage } from './validate.ts';

const QUERY_USER_TURNS = 2;

export function retrievalQuery(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.role === 'user')
    .slice(-QUERY_USER_TURNS)
    .map((m) => m.content)
    .join('\n');
}
