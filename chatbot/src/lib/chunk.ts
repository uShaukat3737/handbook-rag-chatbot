export type Chunk = { id: string; source: string; heading: string; text: string };

type Section = { heading: string; body: string };

const TITLE_LINE = /^# (.+)$/m;
const SECTION_SPLIT = /^## /m;

function toSections(markdown: string, source: string): Section[] {
  const [preamble, ...parts] = markdown.split(SECTION_SPLIT);
  const title = preamble.match(TITLE_LINE)?.[1].trim() ?? source;
  const intro = { heading: title, body: preamble.replace(TITLE_LINE, '').trim() };
  const sections = parts.map((part) => {
    const [name, ...body] = part.split('\n');
    return { heading: `${title} > ${name.trim()}`, body: body.join('\n').trim() };
  });
  return [intro, ...sections].filter((section) => section.body);
}

// ponytail: one chunk per ## section, no size cap or overlap; handbook sections are all < 1.5k chars.
// Add paragraph splitting with overlap if a section ever outgrows the LLM context per chunk.
export function chunkMarkdown(markdown: string, source: string): Chunk[] {
  return toSections(markdown, source).map((section, i) => ({
    id: `${source}#${i}`,
    source,
    heading: section.heading,
    text: `${section.heading}\n${section.body}`,
  }));
}
