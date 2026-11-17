import Groq from 'groq-sdk';

import chunksJson from '@/data/chunks.json';
import { handleChat, type ChatResult } from '@/lib/chat';
import type { Chunk } from '@/lib/chunk';
import { DEFAULT_GROQ_MODEL, ONE_MINUTE_MS, RATE_LIMIT_PER_MINUTE } from '@/lib/config';
import { logError } from '@/lib/log';
import type { LlmMessage } from '@/lib/prompt';
import { createRateLimiter } from '@/lib/rate-limit';

const chunks: Chunk[] = chunksJson;
const allow = createRateLimiter({ limit: RATE_LIMIT_PER_MINUTE, windowMs: ONE_MINUTE_MS });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'Content-Security-Policy': "default-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

const respond = ({ status, body }: ChatResult) => Response.json(body, { status, headers: SECURITY_HEADERS });

async function complete(messages: LlmMessage[]): Promise<string> {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL,
    messages,
    temperature: 0.2,
  });
  return response.choices[0]?.message?.content ?? '';
}

export async function POST(request: Request): Promise<Response> {
  const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local';
  if (!allow(clientKey)) return respond({ status: 429, body: { error: 'Too many requests. Wait a minute and try again.' } });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond({ status: 400, body: { error: 'Request body must be JSON.' } });
  }
  return respond(await handleChat(body, { chunks, complete, logError }));
}
