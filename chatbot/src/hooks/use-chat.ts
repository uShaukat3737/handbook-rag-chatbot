import Constants from 'expo-constants';
import { useRef, useState } from 'react';
import { Platform } from 'react-native';

import { apiBaseUrl } from '@/lib/api-url';
import type { ChatBody, Source } from '@/lib/chat';
import { MAX_MESSAGES, type ChatMessage } from '@/lib/validate';

export type UiMessage = ChatMessage & { id: number; sources?: Source[] };

const API_URL = `${apiBaseUrl({
  os: Platform.OS,
  envUrl: process.env.EXPO_PUBLIC_API_URL,
  hostUri: Constants.expoConfig?.hostUri,
})}/api/chat`;

const NETWORK_ERROR = 'Could not reach the server. Check that the dev server is running and you are on the same network.';

async function postChat(messages: UiMessage[]): Promise<ChatBody> {
  const payload = messages.slice(-MAX_MESSAGES).map(({ role, content }) => ({ role, content }));
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: payload }),
  });
  return (await response.json()) as ChatBody;
}

export function useChat() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(0);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;
    const history: UiMessage[] = [...messages, { id: nextId.current++, role: 'user', content }];
    setMessages(history);
    setPending(true);
    setError(null);
    try {
      const body = await postChat(history);
      if ('error' in body) {
        setError(body.error);
        return;
      }
      setMessages([...history, { id: nextId.current++, role: 'assistant', content: body.answer, sources: body.sources }]);
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setPending(false);
    }
  }

  return { messages, pending, error, send };
}
