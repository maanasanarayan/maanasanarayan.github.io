import { defineConfig, fontProviders } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { remarkReadingTime } from './src/lib/remark-reading-time.mjs';
import { remarkMermaid } from './src/lib/remark-mermaid.mjs';
import draftToolbar from './src/integrations/draft-toolbar.mjs';

import cloudflare from '@astrojs/cloudflare';

const SITE = 'https://maanasa.dev';

// Build a path -> ISO date map from blog frontmatter at config-load time so
// the sitemap reflects real edit dates. We parse YAML by hand to avoid
// pulling in a parser just for this.
const blogLastmod = new Map();
try {
  for (const file of readdirSync('./src/content/blog')) {
    if (!/\.(md|mdx|mdoc)$/.test(file)) continue;
    const slug = file.replace(/\.(md|mdx|mdoc)$/, '');
    const raw = readFileSync(join('./src/content/blog', file), 'utf-8');
    const fm = raw.match(/^---\s*([\s\S]*?)\s*---/)?.[1] ?? '';
    if (/^draft:\s*true/m.test(fm)) continue;
    const updated = fm.match(/^updatedDate:\s*(\S+)/m)?.[1];
    const published = fm.match(/^pubDate:\s*(\S+)/m)?.[1];
    const d = updated ?? published;
    if (d) blogLastmod.set(`/blog/${slug}/`, new Date(d).toISOString());
  }
} catch {
  /* fine to skip if dir missing */
}

const isDevCommand = process.argv.includes('dev');

export default defineConfig({
  site: SITE,

  integrations: [
    react(),
    mdx(),
    markdoc(),
    sitemap({
      filter: (page) => !page.endsWith('/blog/tags/'),
      changefreq: 'monthly',
      priority: 0.7,
      serialize(item) {
        const url = new URL(item.url);
        const lastmod = blogLastmod.get(url.pathname);
        if (lastmod) item.lastmod = lastmod;
        if (url.pathname === '/') item.priority = 1.0;
        else if (url.pathname.startsWith('/blog/') && url.pathname !== '/blog/')
          item.priority = 0.8;
        else if (url.pathname.startsWith('/lifestyle/')) item.priority = 0.8;
        return item;
      },
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    draftToolbar(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Space Grotesk',
      cssVariable: '--font-space-grotesk',
      weights: ['400', '500', '700'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Archivo Black',
      cssVariable: '--font-archivo-black',
      weights: ['400'],
      subsets: ['latin'],
      fallbacks: ['Space Grotesk', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: ['500', '700'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'monospace'],
    },
  ],

  markdown: {
    processor: unified({
      remarkPlugins: [remarkReadingTime, remarkMermaid, remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },

  adapter: isDevCommand
    ? undefined
    : cloudflare({
        imageService: 'compile',
      }),
});
