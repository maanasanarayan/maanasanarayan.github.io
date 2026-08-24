import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const distClient = join(process.cwd(), 'dist/client');
const wranglerPath = join(distClient, 'wrangler.json');

try {
  if (existsSync(wranglerPath)) {
    const content = JSON.parse(readFileSync(wranglerPath, 'utf-8'));
    content.main = '_worker.js';
    content.assets = {
      directory: '.',
      binding: 'ASSETS',
      run_worker_first: ['/*'],
    };
    writeFileSync(wranglerPath, JSON.stringify(content, null, 2));
    console.log(
      '✓ Successfully patched dist/client/wrangler.json with _worker.js and run_worker_first',
    );
  }
} catch (err) {
  console.warn('Could not patch dist/client/wrangler.json:', err.message);
}

// Sitemap lastmod enrichment
const nowW3C = new Date().toISOString().split('T')[0]; // e.g. 2026-08-24
const sitemap0Path = join(distClient, 'sitemap-0.xml');
const sitemapIndexPath = join(distClient, 'sitemap-index.xml');
const sitemapPath = join(distClient, 'sitemap.xml');

try {
  if (existsSync(sitemap0Path)) {
    let sitemap0 = readFileSync(sitemap0Path, 'utf-8');
    // Inject <lastmod> if missing in <url>
    sitemap0 = sitemap0.replace(
      /<url>(?![\s\S]*?<lastmod>)([\s\S]*?)<\/url>/gi,
      (_match, inner) => {
        return `<url>${inner}<lastmod>${nowW3C}</lastmod></url>`;
      },
    );
    // If not replaced (e.g. global check), replace before </url>
    if (!sitemap0.includes('<lastmod>')) {
      sitemap0 = sitemap0.replace(
        /<\/url>/gi,
        `<lastmod>${nowW3C}</lastmod></url>`,
      );
    }
    writeFileSync(sitemap0Path, sitemap0);
    copyFileSync(sitemap0Path, sitemapPath);
    console.log(
      '✓ Injected <lastmod> into sitemap-0.xml and created sitemap.xml',
    );
  }

  if (existsSync(sitemapIndexPath)) {
    let sitemapIndex = readFileSync(sitemapIndexPath, 'utf-8');
    if (!sitemapIndex.includes('<lastmod>')) {
      sitemapIndex = sitemapIndex.replace(
        /<\/sitemap>/gi,
        `<lastmod>${nowW3C}</lastmod></sitemap>`,
      );
      writeFileSync(sitemapIndexPath, sitemapIndex);
      console.log('✓ Injected <lastmod> into sitemap-index.xml');
    }
  }
} catch (err) {
  console.warn('Could not enrich sitemaps:', err.message);
}
