import type { Chunk } from './chunk.ts';
import type { LlmMessage } from './prompt.ts';
import { parseChatRequest } from './validate.ts';

export type Source = { n: number; source: string; heading: string; text: string };
export type ChatBody = { answer: string; sources: Source[] } | { error: string };
export type ChatResult = { status: number; body: ChatBody };

export type ChatDeps = {
  chunks: Chunk[];
  complete: (messages: LlmMessage[]) => Promise<string>;
  logError: (event: string, context: Record<string, unknown>) => void;
};

export async function handleChat(body: unknown, deps: ChatDeps): Promise<ChatResult> {
  const parsed = parseChatRequest(body);
  if (!parsed.ok) return { status: 400, body: { error: parsed.error } };
  return { status: 500, body: { error: 'not implemented' } };
}
