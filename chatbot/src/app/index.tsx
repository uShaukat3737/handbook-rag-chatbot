import { useRef } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatInput } from '@/components/chat-input';
import { MessageBubble } from '@/components/message-bubble';
import { SuggestedPrompts } from '@/components/suggested-prompts';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useChat, type UiMessage } from '@/hooks/use-chat';

function EmptyState() {
  return (
    <ThemedView style={styles.empty}>
      <ThemedText type="subtitle">Brindlewick Handbook</ThemedText>
      <ThemedText themeColor="textSecondary">
        Ask about leave, expenses, IT, benefits and more. Tap a suggestion below to try it.
      </ThemedText>
    </ThemedView>
  );
}

// Expo Router requires a default export for route files.
export default function ChatScreen() {
  const { messages, pending, error, send } = useChat();
  const list = useRef<FlatList<UiMessage>>(null);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList
            ref={list}
            data={messages}
            keyExtractor={(m) => String(m.id)}
            renderItem={({ item }) => <MessageBubble message={item} />}
            ListEmptyComponent={EmptyState}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          />
          {pending && <ActivityIndicator style={styles.status} />}
          {error && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.status} accessibilityRole="alert">
              {error}
            </ThemedText>
          )}
          <SuggestedPrompts onPick={send} disabled={pending} />
          <ChatInput onSend={send} disabled={pending} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  list: { flexGrow: 1, padding: Spacing.three },
  empty: { flex: 1, justifyContent: 'center', gap: Spacing.two },
  status: { marginHorizontal: Spacing.three, marginBottom: Spacing.two },
});
