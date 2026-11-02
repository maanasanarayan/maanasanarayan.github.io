import { getCollection, type CollectionEntry } from 'astro:content';

export type ArtEntry = CollectionEntry<'art'>;
export type ArtType = CollectionEntry<'artTypes'>;
export type ArtColor = ArtType['data']['color'];

/** Literal class names so Tailwind can see them at build time. */
export const ART_BG: Record<ArtColor, string> = {
  accent: 'bg-neo-accent',
  secondary: 'bg-neo-secondary',
  muted: 'bg-neo-muted',
  mint: 'bg-neo-mint',
  sky: 'bg-neo-sky',
};

/** Raw colour values, for inline custom properties (mats, placeholders). */
export const ART_HEX: Record<ArtColor, string> = {
  accent: '#ff6b6b',
  secondary: '#ffd93d',
  muted: '#c4b5fd',
  mint: '#a7f3d0',
  sky: '#93c5fd',
};

export const ART_URL = '/art/';

export const artUrl = (entry: ArtEntry) => `/art/${entry.id}/`;
export const artTypeUrl = (typeId: string) => `/art/type/${typeId}/`;

/**
 * Published artwork, newest first. Drafts show up in `astro dev` only, the
 * same way the blog treats them.
 */
export async function getArt(): Promise<ArtEntry[]> {
  const entries = await getCollection(
    'art',
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  return entries.sort(
    (a, b) =>
      b.data.date.valueOf() - a.data.date.valueOf() ||
      a.data.title.localeCompare(b.data.title),
  );
}

export async function getArtTypes(): Promise<ArtType[]> {
  const types = await getCollection('artTypes');
  return types.sort(
    (a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id),
  );
}

export interface ArtTypeWithCount {
  type: ArtType;
  count: number;
}

/** Every art form with how many published pieces it has. */
export async function getArtTypeCounts(
  entries?: ArtEntry[],
): Promise<ArtTypeWithCount[]> {
  const [types, art] = await Promise.all([
    getArtTypes(),
    entries ? Promise.resolve(entries) : getArt(),
  ]);
  return types.map((type) => ({
    type,
    count: art.filter((e) => e.data.type.id === type.id).length,
  }));
}

export function typeById(types: ArtType[], id: string): ArtType | undefined {
  return types.find((t) => t.id === id);
}

/**
 * Pieces for the editorial spread at the top of /art/: featured pieces first
 * (newest first), topped up with the most recent work.
 */
export function pickFeatured(entries: ArtEntry[], max = 3): ArtEntry[] {
  const featured = entries.filter((e) => e.data.featured);
  const rest = entries.filter((e) => !e.data.featured);
  return [...featured, ...rest].slice(0, max);
}

/** Groups entries (already sorted newest first) by calendar year. */
export function groupByYear(
  entries: ArtEntry[],
): { year: number; entries: ArtEntry[] }[] {
  const groups = new Map<number, ArtEntry[]>();
  for (const entry of entries) {
    const year = entry.data.date.getUTCFullYear();
    const list = groups.get(year) ?? [];
    list.push(entry);
    groups.set(year, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, list]) => ({ year, entries: list }));
}

const monthYear = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const shortMonth = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
});

/** "March 2026" — artwork dates are rarely meaningful to the day. */
export const formatArtDate = (date: Date) => monthYear.format(date);
export const formatArtMonth = (date: Date) => shortMonth.format(date);

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export const pluralPieces = (n: number) =>
  `${n} ${n === 1 ? 'piece' : 'pieces'}`;

/**
 * Responsive widths capped at the source size, plus a matching width/height
 * so the <img> fallback `src` is not a full-resolution original.
 */
export function responsive(
  image: { width: number; height: number },
  widths: number[],
) {
  const usable = widths.filter((w) => w <= image.width);
  const list = usable.length > 0 ? usable : [image.width];
  const width = Math.max(...list);
  return {
    widths: list,
    width,
    height: Math.round((width * image.height) / image.width),
  };
}

/**
 * Sizing classes for an image shown whole inside a fixed-ratio mat: the
 * limiting side is 100%, the other follows from the width/height attributes.
 * Doing this at build time (instead of width/height:auto) means the box is
 * the right size before the image arrives, so nothing shifts.
 */
export function containFit(
  image: { width: number; height: number },
  matAspect: number,
  smMatAspect?: number,
) {
  const ratio = image.width / image.height;
  const base = ratio >= matAspect ? 'h-auto w-full' : 'h-full w-auto';
  if (smMatAspect === undefined) return base;
  const sm =
    ratio >= smMatAspect ? 'sm:h-auto sm:w-full' : 'sm:h-full sm:w-auto';
  return `${base} ${sm}`;
}
