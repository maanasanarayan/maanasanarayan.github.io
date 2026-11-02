import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx,mdoc}',
    base: './src/content/blog',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      heroEmoji: z.string().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

/**
 * Art forms (mandala, lippan, doodle, ...). One entry per form in
 * `src/content/art-types.yaml`; add a new form there and reference its id
 * from an artwork's `type`.
 */
const artTypes = defineCollection({
  loader: file('./src/content/art-types.yaml'),
  schema: z.object({
    name: z.string(),
    /** One or two sentences on the form itself, shown on its filter page. */
    description: z.string(),
    /** Accent used for the type chip; one of the site's neo palette tokens. */
    color: z
      .enum(['accent', 'secondary', 'muted', 'mint', 'sky'])
      .default('secondary'),
    order: z.number().default(0),
  }),
});

/**
 * One artwork per file in `src/content/art/`. Frontmatter holds the facts;
 * the Markdown body is the optional inspiration note shown on the piece's
 * page. Images live next to the entry (or in `src/assets/art/`) so Astro
 * can optimise them.
 */
const art = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/art' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Short excerpt for cards and meta description. */
      excerpt: z.string(),
      type: reference('artTypes'),
      date: z.coerce.date(),
      image: image(),
      imageAlt: z.string(),
      /** Extra views of the same piece (details, process shots). */
      gallery: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      medium: z.string().optional(),
      dimensions: z.string().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      /** Original post, e.g. the Instagram permalink. */
      source: z.url().optional(),
    }),
});

export const collections = { blog, artTypes, art };
