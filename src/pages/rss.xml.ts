import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { BLOG_DESCRIPTION, SITE_URL, getPosts, postHref } from '../lib/blog';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  const site = context.site?.toString() ?? SITE_URL;
  return rss({
    title: 'Maanasa Narayan — Blog',
    description: BLOG_DESCRIPTION,
    // Channel <link> points at the blog; item links resolve from the root.
    site: new URL('/blog/', site).href,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      `<atom:link href="${new URL('/rss.xml', site).href}" rel="self" type="application/rss+xml"/>`,
      '<language>en-us</language>',
      ...(posts[0]
        ? [
            `<lastBuildDate>${(posts[0].data.updatedDate ?? posts[0].data.pubDate).toUTCString()}</lastBuildDate>`,
          ]
        : []),
    ].join(''),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postHref(post),
      categories: post.data.tags,
      author: 'mnsnryn@gmail.com (Maanasa Narayan)',
    })),
  });
}
