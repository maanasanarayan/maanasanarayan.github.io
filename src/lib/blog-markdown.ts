/**
 * Markdown twins of the blog pages. They are emitted at build time as
 * `<page>/index.md`, which is exactly where src/worker.ts looks when a client
 * negotiates `Accept: text/markdown` (and where SiteLayout's
 * `<link rel="alternate" type="text/markdown">` points).
 */
import {
  BLOG_DESCRIPTION,
  SITE_URL,
  getTags,
  isoDate,
  postHref,
  postsWithTag,
  tagHref,
  type Post,
} from './blog';

const yamlString = (value: string) => JSON.stringify(value);

const postLine = (post: Post) =>
  `- [${post.data.title}](${SITE_URL}${postHref(post)}) (${isoDate(post.data.pubDate)}): ${post.data.description} [Markdown](${SITE_URL}${postHref(post)}index.md)`;

export const markdownResponse = (body: string) =>
  new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });

export function postMarkdown(post: Post): string {
  const { data } = post;
  const url = `${SITE_URL}${postHref(post)}`;
  const frontmatter = [
    '---',
    `title: ${yamlString(data.title)}`,
    `description: ${yamlString(data.description)}`,
    `author: "Maanasa Narayan"`,
    `url: ${url}`,
    `published: ${isoDate(data.pubDate)}`,
    ...(data.updatedDate ? [`updated: ${isoDate(data.updatedDate)}`] : []),
    `tags: [${data.tags.map(yamlString).join(', ')}]`,
    '---',
  ];
  return `${frontmatter.join('\n')}\n\n# ${data.title}\n\n> ${data.description}\n\n${(post.body ?? '').trim()}\n\n---\n\nCanonical: ${url}\nMore posts: ${SITE_URL}/blog/\n`;
}

export function blogIndexMarkdown(posts: Post[]): string {
  const tags = getTags(posts);
  return `# Blog — Maanasa Narayan

> ${BLOG_DESCRIPTION}

Canonical: ${SITE_URL}/blog/
RSS: ${SITE_URL}/rss.xml

## Posts (newest first)

${posts.length ? posts.map(postLine).join('\n') : 'No posts published yet.'}

## Tags

${tags.length ? tags.map((t) => `- [${t.tag}](${SITE_URL}${tagHref(t.tag)}) (${t.count})`).join('\n') : 'No tags yet.'}
`;
}

export function tagsIndexMarkdown(posts: Post[]): string {
  const tags = getTags(posts);
  return `# Blog tags — Maanasa Narayan

Canonical: ${SITE_URL}/blog/tags/

${tags.length ? tags.map((t) => `- [${t.tag}](${SITE_URL}${tagHref(t.tag)}) (${t.count} ${t.count === 1 ? 'post' : 'posts'})`).join('\n') : 'No tags yet.'}
`;
}

export function tagMarkdown(posts: Post[], tag: string, slug: string): string {
  const tagged = postsWithTag(posts, slug);
  return `# Posts tagged "${tag}" — Maanasa Narayan

Canonical: ${SITE_URL}/blog/tags/${slug}/
All posts: ${SITE_URL}/blog/

${tagged.map(postLine).join('\n')}
`;
}
