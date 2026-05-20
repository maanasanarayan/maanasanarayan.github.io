import { getCollection } from 'astro:content';

/**
 * Dev-only endpoint that lists draft + future-dated blog posts.
 * Consumed by the custom dev toolbar app.
 */
export async function GET() {
  const now = Date.now();
  const posts = await getCollection('blog');

  const items = posts
    .filter((p) => p.data.draft || p.data.pubDate.valueOf() > now)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((p) => ({
      title: p.data.title,
      url: `/blog/${p.id}/`,
      draft: p.data.draft,
      future: p.data.pubDate.valueOf() > now,
      pubDate: p.data.pubDate.toISOString().slice(0, 10),
    }));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
}
