/**
 * Plain-Markdown renditions of the art pages. SiteLayout advertises
 * `<path>/index.md` as the text/markdown alternate of every page, and the
 * worker serves it to agents that ask for Markdown, so these keep that link
 * honest for the art section.
 */
import {
  artTypeUrl,
  artUrl,
  formatArtDate,
  pluralPieces,
  type ArtEntry,
  type ArtType,
} from './art';
import { absolute } from './art-schema';

const yaml = (value: string) => JSON.stringify(value);

export function frontmatter(fields: Record<string, string | undefined>) {
  const lines = Object.entries(fields)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${yaml(v as string)}`);
  return `---\n${lines.join('\n')}\n---\n\n`;
}

export function pieceLine(entry: ArtEntry, types: ArtType[]) {
  const type = types.find((t) => t.id === entry.data.type.id);
  return `- [${entry.data.title}](${absolute(artUrl(entry))}) — ${type?.data.name ?? entry.data.type.id}, ${formatArtDate(entry.data.date)}. ${entry.data.excerpt}`;
}

export function typeLine(type: ArtType, count: number) {
  return `- [${type.data.name}](${absolute(artTypeUrl(type.id))}) (${pluralPieces(count)}): ${type.data.description}`;
}

export const markdownResponse = (body: string) =>
  new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
