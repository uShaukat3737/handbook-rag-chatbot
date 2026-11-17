import type { Chunk } from './chunk.ts';
import type { LlmMessage } from './prompt.ts';
import { buildPrompt, retrievalQuery } from './prompt.ts';
import { searchChunks } from './search.ts';
import { TOP_K } from './config.ts';
import { parseChatRequest } from './validate.ts';

export type Source = { n: number; source: string; heading: string; text: string };
export type ChatBody = { answer: string; sources: Source[] } | { error: string };
export type ChatResult = { status: number; body: ChatBody };

const LLM_UNAVAILABLE = 'The assistant is unavailable right now. Please try again in a moment.';

export type ChatDeps = {
  chunks: Chunk[];
  complete: (messages: LlmMessage[]) => Promise<string>;
  logError: (event: string, context: Record<string, unknown>) => void;
};

// Some models (gpt-oss) cite as 【1】; the UI expects [1].
function normalizeCitations(answer: string): string {
  return answer.replace(/\s*【(\d+)】/g, ' [$1]');
}

export async function handleChat(body: unknown, deps: ChatDeps): Promise<ChatResult> {
  const parsed = parseChatRequest(body);
  if (!parsed.ok) return { status: 400, body: { error: parsed.error } };

  const hits = searchChunks(deps.chunks, retrievalQuery(parsed.messages), TOP_K);
  try {
    const answer = normalizeCitations(await deps.complete(buildPrompt(parsed.messages, hits)));
    const sources = hits.map((c, i) => ({ n: i + 1, source: c.source, heading: c.heading, text: c.text }));
    return { status: 200, body: { answer, sources } };
  } catch (error) {
    deps.logError('llm_request_failed', { message: error instanceof Error ? error.message : String(error) });
    return { status: 502, body: { error: LLM_UNAVAILABLE } };
  }
}
