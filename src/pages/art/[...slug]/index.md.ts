import type { APIRoute, GetStaticPaths } from 'astro';
import { getImage } from 'astro:assets';
import {
  artTypeUrl,
  artUrl,
  formatArtDate,
  getArt,
  getArtTypes,
  isoDate,
  type ArtEntry,
} from '../../../lib/art';
import { frontmatter, markdownResponse } from '../../../lib/art-markdown';
import { absolute } from '../../../lib/art-schema';

export const getStaticPaths = (async () => {
  const art = await getArt();
  return art.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: ArtEntry }> = async ({ props }) => {
  const { entry } = props;
  const { data } = entry;
  const types = await getArtTypes();
  const type = types.find((t) => t.id === data.type.id);
  const typeName = type?.data.name ?? data.type.id;
  const image = await getImage({
    src: data.image,
    width: Math.min(1200, data.image.width),
    format: 'jpg',
    quality: 80,
  });

  const facts = [
    `- **Form:** [${typeName}](${absolute(artTypeUrl(data.type.id))})`,
    `- **Made:** ${formatArtDate(data.date)}`,
    data.medium && `- **Medium:** ${data.medium}`,
    data.dimensions && `- **Size:** ${data.dimensions}`,
    data.tags.length > 0 && `- **Tags:** ${data.tags.join(', ')}`,
    data.source && `- **Original post:** ${data.source}`,
  ].filter(Boolean);

  let body = frontmatter({
    title: data.title,
    description: data.excerpt,
    type: typeName,
    date: isoDate(data.date),
    canonical: absolute(artUrl(entry)),
  });
  body += `# ${data.title}\n\n`;
  body += `![${data.imageAlt}](${absolute(image.src)})\n\n`;
  body += `${data.excerpt}\n\n`;
  body += `${facts.join('\n')}\n`;
  if (entry.body?.trim()) {
    body += `\n## Inspiration\n\n${entry.body.trim()}\n`;
  }
  body += `\n[Back to all art](https://maanasa.dev/art/)\n`;
  return markdownResponse(body);
};
