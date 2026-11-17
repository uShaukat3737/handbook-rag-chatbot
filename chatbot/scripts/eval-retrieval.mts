// Checks that each eval question retrieves its expected source in the top-k. Run: npm run eval
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { searchChunks } from '../src/lib/search.ts';
import { TOP_K } from '../src/lib/config.ts';
import type { Chunk } from '../src/lib/chunk.ts';

type Eval = { question: string; source: string | null };

const chunks: Chunk[] = JSON.parse(readFileSync(join(import.meta.dirname, '../src/data/chunks.json'), 'utf8'));
const evals: Eval[] = JSON.parse(readFileSync(join(import.meta.dirname, '../../knowledge/evals.json'), 'utf8'));

const answerable = evals.filter((e) => e.source);
const misses = answerable.filter((e) => !searchChunks(chunks, e.question, TOP_K).some((c) => c.source === e.source));

for (const miss of misses) process.stdout.write(`MISS: ${miss.question} (expected ${miss.source})\n`);
process.stdout.write(`hit@${TOP_K}: ${answerable.length - misses.length}/${answerable.length}\n`);
process.exitCode = misses.length ? 1 : 0;
