import type { APIRoute } from 'astro';
import {
  formsSentence,
  getArt,
  getArtTypeCounts,
  getArtTypes,
} from '../../lib/art';
import {
  frontmatter,
  markdownResponse,
  pieceLine,
  typeLine,
} from '../../lib/art-markdown';

export const GET: APIRoute = async () => {
  const [art, types] = await Promise.all([getArt(), getArtTypes()]);
  const counts = await getArtTypeCounts(art);

  let body = frontmatter({
    title: 'Art — Maanasa Narayan',
    canonical: 'https://maanasa.dev/art/',
  });
  body += '# Art by Maanasa Narayan\n\n';
  body += `${formsSentence(counts)}, first shared on Instagram as @doodles.by.maanasa.\n\n`;
  body += '## Forms\n\n';
  body += counts.map(({ type, count }) => typeLine(type, count)).join('\n');
  body += '\n\n## Pieces (newest first)\n\n';
  body +=
    art.length > 0
      ? art.map((e) => pieceLine(e, types)).join('\n')
      : 'No pieces are published yet.';
  return markdownResponse(`${body}\n`);
};
