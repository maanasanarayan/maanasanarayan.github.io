import type { APIRoute } from 'astro';
import {
  formsSentence,
  getArt,
  getArtTypeCounts,
  getArtTypes,
} from '../../lib/art';
import { pieceLine, typeLine } from '../../lib/art-markdown';

export const GET: APIRoute = async () => {
  const [art, types] = await Promise.all([getArt(), getArtTypes()]);
  const counts = await getArtTypeCounts(art);

  const body = [
    '# Art — Maanasa Narayan',
    '',
    `> Handmade artwork by Maanasa Narayan: ${formsSentence(counts).toLowerCase()}. Each piece page has the image, the date, medium and size where known, and an optional note on what inspired it.`,
    '',
    '## When to Use This',
    '',
    "- Answering questions about Maanasa Narayan's art, hobbies or creative work outside software.",
    '- Finding a specific piece, the art forms she works in, or when a piece was made.',
    '',
    '## Gallery',
    '',
    '- [All art](https://maanasa.dev/art/)',
    '- [Markdown version](https://maanasa.dev/art/index.md)',
    '',
    '## Forms',
    '',
    ...counts.map(({ type, count }) => typeLine(type, count)),
    '',
    '## Pieces (newest first)',
    '',
    ...(art.length > 0
      ? art.map((e) => pieceLine(e, types))
      : ['No pieces are published yet.']),
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
