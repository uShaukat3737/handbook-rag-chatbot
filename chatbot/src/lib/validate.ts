export const MAX_MESSAGES = 20;
export const MAX_CONTENT_CHARS = 2000;

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

type ParseResult = { ok: true; messages: ChatMessage[] } | { ok: false; error: string };

function toMessage(value: unknown): ChatMessage | null {
  if (typeof value !== 'object' || value === null) return null;
  const { role, content } = value as Record<string, unknown>;
  if (role !== 'user' && role !== 'assistant') return null;
  if (typeof content !== 'string') return null;
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > MAX_CONTENT_CHARS) return null;
  return { role, content: trimmed };
}

export function parseChatRequest(body: unknown): ParseResult {
  const raw = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) {
    return { ok: false, error: `Send between 1 and ${MAX_MESSAGES} messages.` };
  }
  const messages = raw.map(toMessage);
  if (messages.some((m) => m === null)) {
    return { ok: false, error: `Each message needs a user/assistant role and 1-${MAX_CONTENT_CHARS} characters.` };
  }
  const valid = messages as ChatMessage[];
  if (valid[valid.length - 1].role !== 'user') return { ok: false, error: 'The last message must be from the user.' };
  return { ok: true, messages: valid };
}
