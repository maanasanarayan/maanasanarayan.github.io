import { describe, expect, it } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import worker, {
  parseAccept,
  preferredType,
  appendVaryAccept,
  markdownPath,
} from '../src/worker.ts';

describe('1. Agent-friendly 404s', () => {
  it('returns HTTP 404 status and Markdown body when requesting nonexistent path with Accept: text/markdown', async () => {
    const mockAssets = {
      async fetch(req: Request | string) {
        const url = typeof req === 'string' ? new URL(req) : new URL(req.url);
        if (url.pathname === '/404.md') {
          return new Response(
            '# 404 Not Found\n\n## Where to look next\n\n- [Home](https://maanasa.dev/)\n- [LLMs](https://maanasa.dev/llms.txt)\n- [Sitemap](https://maanasa.dev/sitemap-index.xml)',
            { status: 200, headers: { 'Content-Type': 'text/markdown' } },
          );
        }
        return new Response('Not Found', { status: 404 });
      },
    };

    const req = new Request(
      'https://maanasa.dev/nonexistent-route-for-testing',
      {
        headers: { Accept: 'text/markdown' },
      },
    );
    const res = await worker.fetch(req, { ASSETS: mockAssets });

    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
    const text = await res.text();
    expect(text).toContain('404 Not Found');
    expect(text).toContain('https://maanasa.dev/sitemap-index.xml');
    expect(text).toContain('https://maanasa.dev/llms.txt');
  });

  it('ensures public/404.md exists and contains recovery links', () => {
    const filePath = join(process.cwd(), 'public/404.md');
    expect(existsSync(filePath)).toBe(true);
    const content = readFileSync(filePath, 'utf-8');
    expect(content).toContain('404');
    expect(content).toContain('sitemap-index.xml');
    expect(content).toContain('llms.txt');
  });
});

describe('2. Markdown Content Negotiation (RFC 9110 / acceptmarkdown.com)', () => {
  it('correctly parses Accept headers and q-values', () => {
    const entries = parseAccept('text/markdown;q=0.9, text/html, */*;q=0.1');
    expect(entries).toEqual([
      { type: 'text/markdown', q: 0.9, specificity: 2 },
      { type: 'text/html', q: 1, specificity: 2 },
      { type: '*/*', q: 0.1, specificity: 0 },
    ]);
  });

  it('selects preferredType matching RFC 9110 rules and quality values', () => {
    expect(preferredType('text/markdown')).toBe('text/markdown');
    expect(preferredType('text/markdown, text/html;q=0.8')).toBe(
      'text/markdown',
    );
    expect(preferredType('text/html, text/markdown;q=0.5')).toBe('text/html');
    expect(preferredType('text/html;q=0, text/markdown;q=0')).toBeNull();
    expect(preferredType('*/*')).toBe('text/html'); // default fallback
  });

  it('appends Vary: Accept, Accept-Encoding headers without duplicate tokens', () => {
    const h1 = new Headers();
    appendVaryAccept(h1);
    expect(h1.get('Vary')).toBe('Accept, Accept-Encoding');

    const h2 = new Headers({ Vary: 'Accept-Encoding' });
    appendVaryAccept(h2);
    expect(h2.get('Vary')).toBe('Accept-Encoding, Accept');
  });

  it('maps paths to markdown sibling names', () => {
    expect(markdownPath('/')).toBe('/index.md');
    expect(markdownPath('/about')).toBe('/about/index.md');
    expect(markdownPath('/contact/')).toBe('/contact/index.md');
  });

  it('returns HTTP 406 Not Acceptable when client rejects all produced types', async () => {
    const mockAssets = {
      async fetch() {
        return new Response('ok', { status: 200 });
      },
    };

    const req = new Request('https://maanasa.dev/', {
      headers: { Accept: 'text/html;q=0, text/markdown;q=0' },
    });
    const res = await worker.fetch(req, { ASSETS: mockAssets });

    expect(res.status).toBe(406);
    expect(res.headers.get('Vary')).toContain('Accept');
  });

  it('serves markdown file with Vary: Accept and Link canonical header', async () => {
    const mockAssets = {
      async fetch(r: Request | string) {
        const url = typeof r === 'string' ? new URL(r) : new URL(r.url);
        if (url.pathname === '/index.md') {
          return new Response('# Maanasa Narayan\n\nSoftware Engineer', {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
        return new Response('Not Found', { status: 404 });
      },
    };

    const req = new Request('https://maanasa.dev/', {
      headers: { Accept: 'text/markdown' },
    });
    const res = await worker.fetch(req, { ASSETS: mockAssets });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
    expect(res.headers.get('Vary')).toContain('Accept');
    expect(res.headers.get('Link')).toContain('rel="canonical"');
  });
});

describe('3. Agent Instruction / When-to-Use (llms.txt)', () => {
  it('ensures public/llms.txt contains When to Use This and citation guidelines', () => {
    const content = readFileSync(
      join(process.cwd(), 'public/llms.txt'),
      'utf-8',
    );
    expect(content).toContain('## When to Use This');
    expect(content).toContain('## How to Reference');
    expect(content).toContain('Software Engineer');
  });

  it('ensures public/llms-full.txt exists and is populated', () => {
    const content = readFileSync(
      join(process.cwd(), 'public/llms-full.txt'),
      'utf-8',
    );
    expect(content.length).toBeGreaterThan(1000);
    expect(content).toContain('## When to Use This');
    expect(content).toContain('Work Experience');
  });
});

describe('4. Organization & Person Schema Completeness', () => {
  it('validates JSON-LD schema includes Person, Organization, contactPoint, and PostalAddress', () => {
    const layoutContent = readFileSync(
      join(process.cwd(), 'src/layouts/SiteLayout.astro'),
      'utf-8',
    );
    expect(layoutContent).toContain("'Person'");
    expect(layoutContent).toContain("'Organization'");
    expect(layoutContent).toContain("'ContactPoint'");
    expect(layoutContent).toContain("'PostalAddress'");
    expect(layoutContent).toContain('contactType');
    expect(layoutContent).toContain('addressLocality');
  });
});

describe('5. Trust Anchor Pages & Static Markdown Siblings', () => {
  it('ensures /about, /contact, /privacy pages exist with Markdown siblings and >500 chars of content', () => {
    const pages = ['about', 'contact', 'privacy'];
    for (const page of pages) {
      const astroPage = join(process.cwd(), `src/pages/${page}.astro`);
      const mdPage = join(process.cwd(), `public/${page}/index.md`);
      const mdAlias = join(process.cwd(), `public/${page}.md`);

      expect(existsSync(astroPage)).toBe(true);
      expect(existsSync(mdPage)).toBe(true);
      expect(existsSync(mdAlias)).toBe(true);

      const astroText = readFileSync(astroPage, 'utf-8');
      const mdText = readFileSync(mdPage, 'utf-8');

      expect(astroText.length).toBeGreaterThan(500);
      expect(mdText.length).toBeGreaterThan(500);
    }
  });
});

describe('6. Homepage Heading Tree Hierarchy & SSR Content Length', () => {
  it('validates index.html contains an H1 and structured semantic heading hierarchy', () => {
    const indexPath = join(process.cwd(), 'dist/client/index.html');
    expect(existsSync(indexPath)).toBe(true);
    const html = readFileSync(indexPath, 'utf-8');

    // H1 check
    expect(html).toMatch(/<h1[\s>]/i);

    // Text content length > 500 characters
    const cleanText = html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    expect(cleanText.length).toBeGreaterThan(500);

    // Strict hierarchy checks
    expect(html).toContain('About &amp; Skills.');
    expect(html).toContain('Technical Skills');
    expect(html).toContain('Work Experience.');
    expect(html).toContain('Featured Projects.');
    expect(html).toContain('Recommendations.');
    expect(html).toContain('Contact.');
  });
});

describe('7. Cloudflare Pages Middleware', () => {
  it('handles markdown negotiation and 404 recovery in functions/_middleware.ts', async () => {
    const { onRequest } = await import('../functions/_middleware.ts');

    // Test markdown negotiation
    const req = new Request('https://maanasa.dev/', {
      headers: { Accept: 'text/markdown' },
    });
    const nextMock = async (r?: Request | string) => {
      const u =
        typeof r === 'string'
          ? new URL(r)
          : r
            ? new URL(r.url)
            : new URL('https://maanasa.dev/');
      if (u.pathname === '/index.md') {
        return new Response('# Maanasa Narayan\n\nSoftware Engineer', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      return new Response('Not Found', { status: 404 });
    };

    const res = await onRequest({
      request: req,
      next: nextMock,
      functionPath: '',
      waitUntil: () => {},
      env: {},
      params: {},
      data: {},
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
    expect(res.headers.get('Vary')).toContain('Accept');
  });
});
