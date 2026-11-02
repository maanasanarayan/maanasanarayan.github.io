import type { APIRoute } from 'astro';
import { getPosts } from '../../lib/blog';
import { blogIndexMarkdown, markdownResponse } from '../../lib/blog-markdown';

export const GET: APIRoute = async () =>
  markdownResponse(blogIndexMarkdown(await getPosts()));
