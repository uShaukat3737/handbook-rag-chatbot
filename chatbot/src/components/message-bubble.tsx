import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { UiMessage } from '@/hooks/use-chat';
import type { Source } from '@/lib/chat';

function SourceList({ sources }: { sources: Source[] }) {
  return (
    <View style={styles.sources}>
      {sources.map((s) => (
        <ThemedView key={s.n} type="background" style={styles.source}>
          <ThemedText type="smallBold">
            [{s.n}] {s.source}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {s.text}
          </ThemedText>
        </ThemedView>
      ))}
    </View>
  );
}

export function MessageBubble({ message }: { message: UiMessage }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';
  const sources = message.sources ?? [];

  return (
    <ThemedView
      type={isUser ? 'backgroundSelected' : 'backgroundElement'}
      style={[styles.bubble, isUser ? styles.user : styles.assistant]}>
      <ThemedText>{message.content}</ThemedText>
      {sources.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showSources }}
          onPress={() => setShowSources((v) => !v)}
          style={styles.toggle}>
          <ThemedText type="linkPrimary">
            {showSources ? 'Hide sources' : `Show sources (${sources.length})`}
          </ThemedText>
        </Pressable>
      )}
      {showSources && <SourceList sources={sources} />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bubble: { borderRadius: 16, padding: Spacing.three, marginVertical: Spacing.one, maxWidth: '88%' },
  user: { alignSelf: 'flex-end' },
  assistant: { alignSelf: 'flex-start' },
  toggle: { marginTop: Spacing.two, alignSelf: 'flex-start' },
  sources: { gap: Spacing.two, marginTop: Spacing.one },
  source: { borderRadius: 10, padding: Spacing.two, gap: Spacing.one },
});
