import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx,mdoc}',
    base: './src/content/blog',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    heroEmoji: z.string().optional(),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    inspiration: z.string(),
    medium: z.string(),
    year: z.number().int(),
    dimensions: z.string().optional(),
    palette: z.array(z.string()).default([]),
    category: z.enum([
      'ceramics',
      'textiles',
      'prints',
      'paper',
      'mixed-media',
      'home-decor',
    ]),
    image: z.string(),
    imageAlt: z.string(),
    /** Aspect ratio used for the gallery tile (`portrait` | `landscape` | `square`). */
    aspect: z.enum(['portrait', 'landscape', 'square']).default('portrait'),
    /** Display order in the gallery (lower comes first). */
    order: z.number().default(0),
    draft: z.boolean().default(false),
    permalink: z.string().url().optional(),
  }),
});

export const collections = { blog, gallery };
