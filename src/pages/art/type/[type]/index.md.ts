import type { APIRoute, GetStaticPaths } from 'astro';
import {
  artTypeUrl,
  getArt,
  getArtTypes,
  type ArtType,
} from '../../../../lib/art';
import {
  frontmatter,
  markdownResponse,
  pieceLine,
} from '../../../../lib/art-markdown';
import { absolute } from '../../../../lib/art-schema';

export const getStaticPaths = (async () => {
  const types = await getArtTypes();
  return types.map((type) => ({ params: { type: type.id }, props: { type } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ type: ArtType }> = async ({ props }) => {
  const { type } = props;
  const [art, types] = await Promise.all([getArt(), getArtTypes()]);
  const entries = art.filter((e) => e.data.type.id === type.id);

  let body = frontmatter({
    title: `${type.data.name} — Art by Maanasa Narayan`,
    canonical: absolute(artTypeUrl(type.id)),
  });
  body += `# ${type.data.name}\n\n${type.data.description}\n\n## Pieces\n\n`;
  body +=
    entries.length > 0
      ? entries.map((e) => pieceLine(e, types)).join('\n')
      : 'No pieces in this form are published yet.';
  body += '\n\n[All art](https://maanasa.dev/art/)\n';
  return markdownResponse(body);
};
