import type { APIRoute } from 'astro';
import {
  BLOG_DESCRIPTION,
  SITE_URL,
  isoDate,
  postHref,
  getPosts,
} from '../../lib/blog';

/** Section-level llms.txt for the blog, generated from published posts. */
export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const body = `# Maanasa Narayan — Blog

> ${BLOG_DESCRIPTION}

Every post has a Markdown twin at \`<post url>index.md\`; HTML pages also
return Markdown when requested with \`Accept: text/markdown\`.

## Posts

${
  posts.length
    ? posts
        .map(
          (p) =>
            `- [${p.data.title}](${SITE_URL}${postHref(p)}index.md): ${p.data.description} (${isoDate(p.data.pubDate)})`,
        )
        .join('\n')
    : '- No posts published yet.'
}

## Optional

- [Blog index (HTML)](${SITE_URL}/blog/)
- [Blog index (Markdown)](${SITE_URL}/blog/index.md)
- [Tags](${SITE_URL}/blog/tags/)
- [RSS feed](${SITE_URL}/rss.xml)
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
