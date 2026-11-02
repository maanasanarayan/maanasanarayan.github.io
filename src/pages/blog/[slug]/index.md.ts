import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts, type Post } from '../../../lib/blog';
import { markdownResponse, postMarkdown } from '../../../lib/blog-markdown';

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  markdownResponse(postMarkdown((props as { post: Post }).post));
