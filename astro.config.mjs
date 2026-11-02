import { defineConfig, fontProviders } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
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
    if (!d || new Date(published).valueOf() > Date.now()) continue;
    const iso = new Date(d).toISOString();
    blogLastmod.set(`/blog/${slug}/`, iso);
    // The blog index changes whenever any post does.
    if (iso > (blogLastmod.get('/blog/') ?? '')) blogLastmod.set('/blog/', iso);
  }
} catch {
  /* fine to skip if dir missing */
}

// Same for art: piece dates become <lastmod>, and art-type pages with no
// published pieces yet are left out of the sitemap.
const artLastmod = new Map();
const artTypesInUse = new Set();
try {
  const files = readdirSync('./src/content/art', { recursive: true });
  for (const file of files.map(String)) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const raw = readFileSync(join('./src/content/art', file), 'utf-8');
    const fm = raw.match(/^---\s*([\s\S]*?)\s*---/)?.[1] ?? '';
    if (/^draft:\s*true/m.test(fm)) continue;
    const type = fm.match(/^type:\s*['"]?([\w-]+)/m)?.[1];
    if (type) artTypesInUse.add(type);
    const slug =
      fm.match(/^slug:\s*['"]?([^'"\n]+)/m)?.[1] ??
      file
        .replace(/\.(md|mdx)$/, '')
        .replace(/(^|\/)index$/, '')
        .toLowerCase()
        .replace(/[^\w/ -]/g, '')
        .replace(/ /g, '-');
    const date = fm.match(/^date:\s*['"]?([\d-]+)/m)?.[1];
    if (date) artLastmod.set(`/art/${slug}/`, new Date(date).toISOString());
  }
} catch {
  /* no art yet */
}

const isDevCommand = process.argv.includes('dev');

export default defineConfig({
  site: SITE,
  output: 'static',
  session: false,
  build: {
    inlineStylesheets: 'always',
  },

  integrations: [
    mdx(),
    markdoc(),
    sitemap({
      // Drafts and future-dated posts never reach the sitemap: their pages
      // are not generated in production (see src/lib/blog.ts). Art-type
      // pages with no published pieces yet are left out too.
      filter: (page) =>
        !page.endsWith('/404.html') &&
        !page.endsWith('/404/') &&
        !(
          /\/art\/type\/[^/]+\/$/.test(page) &&
          !artTypesInUse.has(page.split('/').at(-2))
        ),
      changefreq: 'monthly',
      priority: 0.7,
      serialize(item) {
        const url = new URL(item.url);
        const lastmod =
          blogLastmod.get(url.pathname) ?? artLastmod.get(url.pathname);
        if (lastmod) item.lastmod = lastmod;
        if (url.pathname === '/') item.priority = 1.0;
        else if (
          url.pathname === '/about/' ||
          url.pathname === '/contact/' ||
          url.pathname === '/privacy/' ||
          url.pathname === '/about' ||
          url.pathname === '/contact' ||
          url.pathname === '/privacy'
        )
          item.priority = 0.8;
        else if (url.pathname === '/blog/') item.priority = 0.8;
        else if (url.pathname.startsWith('/blog/tags/')) item.priority = 0.4;
        else if (url.pathname.startsWith('/blog/')) item.priority = 0.8;
        else if (url.pathname === '/art/') item.priority = 0.8;
        else if (url.pathname.startsWith('/art/type/')) item.priority = 0.6;
        return item;
      },
    }),
    draftToolbar(),
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          sanitizeFileName(name) {
            return name.replace(/^\.+/, '');
          },
        },
      },
    },
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
