// Builds src/data/chunks.json from ../knowledge/*.md. Run: npm run ingest
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chunkMarkdown } from '../src/lib/chunk.ts';

const KNOWLEDGE_DIR = join(import.meta.dirname, '../../knowledge');
const OUT_FILE = join(import.meta.dirname, '../src/data/chunks.json');

const chunks = readdirSync(KNOWLEDGE_DIR)
  .filter((file) => file.endsWith('.md'))
  .sort()
  .flatMap((file) => chunkMarkdown(readFileSync(join(KNOWLEDGE_DIR, file), 'utf8'), file));

writeFileSync(OUT_FILE, `${JSON.stringify(chunks, null, 2)}\n`);
process.stdout.write(`Wrote ${chunks.length} chunks to src/data/chunks.json\n`);
