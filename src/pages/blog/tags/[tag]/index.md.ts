import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts, getTags } from '../../../../lib/blog';
import { markdownResponse, tagMarkdown } from '../../../../lib/blog-markdown';

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return getTags(posts).map(({ tag, slug }) => ({
    params: { tag: slug },
    props: { tag, slug },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { tag, slug } = props as { tag: string; slug: string };
  return markdownResponse(tagMarkdown(await getPosts(), tag, slug));
};
