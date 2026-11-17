import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// Taken from knowledge/evals.json; the last one is deliberately not in the handbook.
const PROMPTS = [
  'How many days of annual leave do I get?',
  'What is the hotel limit in a capital city?',
  'I lost my laptop at the airport. What do I do?',
  'When are promotions decided?',
  'Can I keep a €100 gift from a supplier?',
  'Do employees get a company car?',
];

type Props = { onPick: (prompt: string) => void; disabled: boolean };

export function SuggestedPrompts({ onPick, disabled }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {PROMPTS.map((prompt) => (
        <Pressable key={prompt} accessibilityRole="button" disabled={disabled} onPress={() => onPick(prompt)}>
          <ThemedView type="backgroundElement" style={[styles.chip, disabled && styles.disabled]}>
            <ThemedText type="small">{prompt}</ThemedText>
          </ThemedView>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  chip: { borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  disabled: { opacity: 0.5 },
});
