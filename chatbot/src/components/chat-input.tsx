import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MAX_CONTENT_CHARS } from '@/lib/validate';

type Props = { onSend: (text: string) => void; disabled: boolean };

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const theme = useTheme();
  const canSend = !disabled && text.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <TextInput
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        placeholder="Ask about the handbook…"
        placeholderTextColor={theme.textSecondary}
        maxLength={MAX_CONTENT_CHARS}
        returnKeyType="send"
        accessibilityLabel="Message"
        style={[styles.input, { color: theme.text }]}
      />
      <Pressable accessibilityRole="button" disabled={!canSend} onPress={submit} style={styles.send}>
        <ThemedText type="smallBold" themeColor={canSend ? 'text' : 'textSecondary'}>
          Send
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    paddingLeft: Spacing.three,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: Spacing.three },
  send: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
});
