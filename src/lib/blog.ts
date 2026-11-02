import { getCollection, render, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export const SITE_URL = 'https://maanasa.dev';
export const BLOG_TITLE = 'Blog — Maanasa Narayan';
export const BLOG_DESCRIPTION =
  'Notes from Maanasa Narayan, a software engineer, on building and shipping software.';

/**
 * A post is public once it is not a draft and its pubDate has arrived.
 * `astro dev` shows everything so drafts can be previewed (the dev toolbar
 * links straight to them); production builds, RSS, the sitemap, search and the
 * markdown twins only ever see public posts because they all read from here.
 */
function isPublic(post: Post, now = Date.now()): boolean {
  return !post.data.draft && post.data.pubDate.valueOf() <= now;
}

const includeInBuild = (post: Post) => !import.meta.env.PROD || isPublic(post);

/** Every visible post, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', includeInBuild);
  return posts.sort(
    (a, b) =>
      b.data.pubDate.valueOf() - a.data.pubDate.valueOf() ||
      a.data.title.localeCompare(b.data.title),
  );
}

export function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
  const years = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.pubDate.getUTCFullYear();
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, list]) => ({ year, posts: list }));
}

/** URL-safe tag slug: "Cloud Native" -> "cloud-native". */
function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const tagHref = (tag: string) => `/blog/tags/${tagSlug(tag)}/`;
export const postHref = (post: Post) => `/blog/${post.id}/`;

export function getTags(
  posts: Post[],
): { tag: string; slug: string; count: number }[] {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = tagSlug(tag);
      const entry = counts.get(slug) ?? { tag, count: 0 };
      entry.count += 1;
      counts.set(slug, entry);
    }
  }
  return [...counts.entries()]
    .map(([slug, { tag, count }]) => ({ tag, slug, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function postsWithTag(posts: Post[], slug: string): Post[] {
  return posts.filter((post) =>
    post.data.tags.some((t) => tagSlug(t) === slug),
  );
}

/** Chronological neighbours: `newer` and `older` relative to `post`. */
export function getNeighbours(
  posts: Post[],
  post: Post,
): { newer: Post | null; older: Post | null } {
  const i = posts.findIndex((p) => p.id === post.id);
  if (i === -1) return { newer: null, older: null };
  return { newer: posts[i - 1] ?? null, older: posts[i + 1] ?? null };
}

/** Posts sharing the most tags with `post`, ties broken by recency. */
export function getRelated(posts: Post[], post: Post, limit = 3): Post[] {
  const mine = new Set(post.data.tags.map(tagSlug));
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      post: p,
      score: p.data.tags.filter((t) => mine.has(tagSlug(t))).length,
    }))
    .filter((r) => r.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf(),
    )
    .slice(0, limit)
    .map((r) => r.post);
}

/** Reading time from the remark plugin in astro.config.mjs ("3 min read"). */
export async function getReadingTime(post: Post): Promise<string> {
  const { remarkPluginFrontmatter } = await render(post);
  return (remarkPluginFrontmatter?.minutesRead as string | undefined) ?? '';
}

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
