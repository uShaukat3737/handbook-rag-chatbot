import type { Chunk } from './chunk.ts';

// Standard BM25 tuning constants.
const K1 = 1.2;
const B = 0.75;

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}€%]+/gu) ?? [];
}

function countTerms(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return counts;
}

// ponytail: rebuilds term stats on every query. Fine for ~40 chunks; precompute an index past a few thousand.
export function searchChunks(chunks: Chunk[], query: string, k: number): Chunk[] {
  const queryTerms = new Set(tokenize(query));
  const docs = chunks.map((chunk) => {
    const tokens = tokenize(chunk.text);
    return { chunk, length: tokens.length, terms: countTerms(tokens) };
  });
  const avgLength = docs.reduce((sum, doc) => sum + doc.length, 0) / (docs.length || 1);

  const idf = (term: string) => {
    const df = docs.filter((doc) => doc.terms.has(term)).length;
    return Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
  };

  const score = (doc: (typeof docs)[number]) =>
    [...queryTerms].reduce((sum, term) => {
      const tf = doc.terms.get(term) ?? 0;
      const norm = tf + K1 * (1 - B + (B * doc.length) / avgLength);
      return sum + (tf ? (idf(term) * tf * (K1 + 1)) / norm : 0);
    }, 0);

  return docs
    .map((doc) => ({ chunk: doc.chunk, score: score(doc) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((hit) => hit.chunk);
}
