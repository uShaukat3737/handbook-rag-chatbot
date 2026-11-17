export type Chunk = { id: string; source: string; heading: string; text: string };

export function chunkMarkdown(markdown: string, source: string): Chunk[] {
  if (!markdown.trim()) return [];
  return [{ id: `${source}#0`, source, heading: '', text: markdown.trim() }];
}
