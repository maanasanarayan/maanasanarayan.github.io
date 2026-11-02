import type { APIRoute } from 'astro';
import { getPosts } from '../../../lib/blog';
import {
  markdownResponse,
  tagsIndexMarkdown,
} from '../../../lib/blog-markdown';

export const GET: APIRoute = async () =>
  markdownResponse(tagsIndexMarkdown(await getPosts()));
