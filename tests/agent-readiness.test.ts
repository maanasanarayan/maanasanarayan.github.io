import { describe, expect, it } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import worker, {
  parseAccept,
  preferredType,
  appendVaryAccept,
  markdownPath,
  isBotUA,
} from '../src/worker.ts';

describe('1. Agent-friendly 404s', () => {
  it('returns HTTP 404 status and Markdown body when requesting nonexistent path with Accept: text/markdown', async () => {
    const mockAssets = {
      async fetch(req: Request | string) {
        const url = typeof req === 'string' ? new URL(req) : new URL(req.url);
        if (url.pathname === '/404.md') {
          return new Response(
            '---\ntitle: "404 Not Found"\n---\n\n# 404 Not Found\n\n## Where to look next\n\n- [Home](https://maanasa.dev/)\n- [LLMs](https://maanasa.dev/llms.txt)\n- [Sitemap](https://maanasa.dev/sitemap-index.xml)',
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
          return new Response(
            '---\ntitle: "Maanasa Narayan"\n---\n\n# Maanasa Narayan\n\nSoftware Engineer',
            {
              status: 200,
              headers: { 'Content-Type': 'text/plain' },
            },
          );
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

  it('detects AI bot User-Agents and serves markdown', () => {
    expect(isBotUA('GPTBot/1.0')).toBe(true);
    expect(isBotUA('ClaudeBot/1.0')).toBe(true);
    expect(isBotUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe(
      false,
    );
  });
});

describe('3. Agent Instruction / When-to-Use (llms.txt)', () => {
  it('ensures public/llms.txt contains When to Use This and citation guidelines', () => {
    const content = readFileSync(
      join(process.cwd(), 'public/llms.txt'),
      'utf-8',
    );
    expect(content).toContain('## When to Use This');
    expect(content).toContain('Software Engineer');
    expect(content).toContain('[About Maanasa]');
    expect(content).toContain('## Sandbox / Test Environment');
  });

  it('ensures modular section-level llms.txt files exist', () => {
    const sections = [
      'about',
      'contact',
      'projects',
      'skills',
      'experience',
      'docs',
      'api',
    ];
    for (const s of sections) {
      const p = join(process.cwd(), `public/${s}/llms.txt`);
      expect(existsSync(p)).toBe(true);
    }
  });
});

describe('4. Extended Schema Completeness & WebMCP', () => {
  it('validates JSON-LD schema includes Person, Organization, FAQPage, Service, AggregateRating, BreadcrumbList', () => {
    const layoutContent = readFileSync(
      join(process.cwd(), 'src/layouts/SiteLayout.astro'),
      'utf-8',
    );
    expect(layoutContent).toContain("'Person'");
    expect(layoutContent).toContain("'Organization'");
    expect(layoutContent).toContain("'ContactPoint'");
    expect(layoutContent).toContain("'PostalAddress'");
    expect(layoutContent).toContain("'FAQPage'");
    expect(layoutContent).toContain("'Service'");
    expect(layoutContent).toContain("'AggregateRating'");
    expect(layoutContent).toContain("'BreadcrumbList'");
  });

  it('validates WebMCP client-side registration and action form attributes', () => {
    const layoutContent = readFileSync(
      join(process.cwd(), 'src/layouts/SiteLayout.astro'),
      'utf-8',
    );
    expect(layoutContent).toContain('modelContext');
    expect(layoutContent).toContain('registerTool');

    const contactContent = readFileSync(
      join(process.cwd(), 'src/components/Contact.astro'),
      'utf-8',
    );
    expect(contactContent).toContain("toolname: 'contact_maanasa'");
    expect(contactContent).toContain('tooldescription:');
  });
});

describe('5. Agent Mode View (?mode=agent)', () => {
  it('returns structured JSON data when ?mode=agent is present', async () => {
    const req = new Request('https://maanasa.dev/?mode=agent');
    const res = await worker.fetch(req, {});

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    const data = await res.json();
    expect(data.mode).toBe('agent');
    expect(data.entity).toBe('Maanasa Narayan');
    expect(data.endpoints.ask_nlweb).toBe('https://maanasa.dev/ask');
    expect(data.skills.length).toBeGreaterThan(5);
  });
});

describe('6. Microsoft NLWeb Protocol (/ask)', () => {
  it('returns JSON answer response on POST /ask', async () => {
    const req = new Request('https://maanasa.dev/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Tell me about Maanasa' }),
    });
    const res = await worker.fetch(req, {});

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    const data = await res.json();
    expect(data._meta.protocol).toBe('NLWeb');
    expect(data.answers.length).toBeGreaterThan(0);
  });

  it('supports SSE streaming when Accept: text/event-stream is present', async () => {
    const req = new Request('https://maanasa.dev/ask?q=experience', {
      headers: { Accept: 'text/event-stream' },
    });
    const res = await worker.fetch(req, {});

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/event-stream');
    const text = await res.text();
    expect(text).toContain('event: start');
    expect(text).toContain('event: result');
    expect(text).toContain('event: complete');
  });
});

describe('7. RFC 9727 API Catalog & Discovery Metadata', () => {
  it('serves RFC 9727 API catalog with correct linkset profile', async () => {
    const req = new Request('https://maanasa.dev/.well-known/api-catalog');
    const res = await worker.fetch(req, {});

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain(
      'application/linkset+json',
    );
    const data = await res.json();
    expect(data.linkset).toBeDefined();
    expect(data.linkset[0]['service-desc']).toBeDefined();
  });

  it('ensures all well-known discovery documents exist', () => {
    const docs = [
      'public/.well-known/ai-catalog.json',
      'public/.well-known/agent-skills/index.json',
      'public/.well-known/agent-card.json',
      'public/.well-known/mcp/server-card.json',
      'public/.well-known/mcp/docs-server-card.json',
      'public/.well-known/oauth-protected-resource',
      'public/.well-known/oauth-authorization-server',
      'public/.well-known/http-message-signatures-directory',
      'public/api/openapi.json',
      'public/auth.md',
      'public/schemamap.xml',
      'SKILL.md',
    ];
    for (const d of docs) {
      expect(existsSync(join(process.cwd(), d))).toBe(true);
    }
  });

  it('validates auth entrypoints return 401 with WWW-Authenticate hint', async () => {
    const req = new Request('https://maanasa.dev/api');
    const res = await worker.fetch(req, {});

    expect(res.status).toBe(401);
    expect(res.headers.get('WWW-Authenticate')).toContain(
      'resource_metadata="https://maanasa.dev/.well-known/oauth-protected-resource"',
    );
  });

  it('validates agent registration endpoints respond with 200', async () => {
    const req = new Request('https://maanasa.dev/api/agent/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await worker.fetch(req, {});
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('registered');
  });
});

describe('8. REST v1 Endpoints & API Usability', () => {
  it('serves /v1/profile with rate limit and deprecation headers', async () => {
    const req = new Request('https://maanasa.dev/v1/profile');
    const res = await worker.fetch(req, {});

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    expect(res.headers.get('RateLimit-Limit')).toBe('100');
    expect(res.headers.get('RateLimit-Remaining')).toBe('99');
    expect(res.headers.get('Sunset')).toBeDefined();

    const data = await res.json();
    expect(data.name).toBe('Maanasa Narayan');
    expect(data.company).toBe('Google');
  });

  it('serves paginated /v1/experience and /v1/projects', async () => {
    const reqExp = new Request('https://maanasa.dev/v1/experience?limit=10');
    const resExp = await worker.fetch(reqExp, {});
    expect(resExp.status).toBe(200);
    const expData = await resExp.json();
    expect(expData.items.length).toBeGreaterThan(0);
    expect(expData.total).toBeDefined();

    const reqProj = new Request('https://maanasa.dev/v1/projects');
    const resProj = await worker.fetch(reqProj, {});
    expect(resProj.status).toBe(200);
    const projData = await resProj.json();
    expect(projData.items.length).toBeGreaterThan(0);
  });

  it('supports async jobs and batch operations', async () => {
    const jobReq = new Request('https://maanasa.dev/v1/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const jobRes = await worker.fetch(jobReq, {});
    expect(jobRes.status).toBe(202);
    expect(jobRes.headers.get('Location')).toContain('/v1/jobs/');

    const batchReq = new Request('https://maanasa.dev/v1/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operations: [{ method: 'GET', path: '/v1/profile' }],
      }),
    });
    const batchRes = await worker.fetch(batchReq, {});
    expect(batchRes.status).toBe(200);
  });

  it('returns RFC 9457 Problem Details on invalid API endpoints', async () => {
    const req = new Request('https://maanasa.dev/v1/nonexistent');
    const res = await worker.fetch(req, {});
    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toContain(
      'application/problem+json',
    );
    const data = await res.json();
    expect(data.type).toBe('https://maanasa.dev/errors/not-found');
    expect(data.code).toBe('ENDPOINT_NOT_FOUND');
  });

  it('ensures public/auth.md starts with a leading markdown heading without frontmatter issues', () => {
    const content = readFileSync(
      join(process.cwd(), 'public/auth.md'),
      'utf-8',
    );
    expect(content.startsWith('# Agent Authentication Guide')).toBe(true);
  });

  it('ensures Agent Skills index matches v0.2.0 schema', () => {
    const content = JSON.parse(
      readFileSync(
        join(process.cwd(), 'public/.well-known/agent-skills/index.json'),
        'utf-8',
      ),
    );
    expect(content.$schema).toBe(
      'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    );
    expect(content.version).toBe('0.2.0');
    expect(content.skills[0].type).toBe('skill-md');
    expect(content.skills[0].digest).toContain('sha256:');
  });

  it('ensures ARD ai-catalog.json has specVersion and valid entries with identifier and displayName', () => {
    const content = JSON.parse(
      readFileSync(
        join(process.cwd(), 'public/.well-known/ai-catalog.json'),
        'utf-8',
      ),
    );
    expect(content.specVersion).toBe('1.0');
    expect(Array.isArray(content.entries)).toBe(true);
    expect(content.entries.length).toBeGreaterThan(0);
    expect(content.entries[0].identifier).toContain('urn:air:');
    expect(content.entries[0].displayName).toBeDefined();
    expect(content.entries[0].mediaType).toBeDefined();
    expect(content.entries[0].trustManifest).toBeDefined();
  });

  it('ensures root public/openapi.json exists', () => {
    expect(existsSync(join(process.cwd(), 'public/openapi.json'))).toBe(true);
  });

  it('handles MCP JSON-RPC protocol handshake and tools/list', async () => {
    const initReq = new Request('https://maanasa.dev/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }),
    });
    const initRes = await worker.fetch(initReq, {});
    expect(initRes.status).toBe(200);
    const initData = await initRes.json();
    expect(initData.result.protocolVersion).toBe('2024-11-05');
    expect(initData.result.serverInfo.name).toBe('maanasa-mcp');

    const toolsReq = new Request('https://maanasa.dev/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
    });
    const toolsRes = await worker.fetch(toolsReq, {});
    expect(toolsRes.status).toBe(200);
    const toolsData = await toolsRes.json();
    expect(toolsData.result.tools.length).toBeGreaterThan(0);
  });

  it('serves sandbox endpoint with test credentials', async () => {
    const req = new Request('https://maanasa.dev/api/sandbox');
    const res = await worker.fetch(req, {});
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.mode).toBe('sandbox');
    expect(data.mock_token).toBeDefined();
  });

  it('handles MCP resources/list and resources/read with valid MIME types', async () => {
    const listReq = new Request('https://maanasa.dev/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'resources/list' }),
    });
    const listRes = await worker.fetch(listReq, {});
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(listData.result.resources.length).toBeGreaterThan(0);
    for (const r of listData.result.resources) {
      expect(r.uri).toBeDefined();
      expect(r.mimeType).toBeDefined();
      expect(r.name).toBeDefined();
    }

    const readReq = new Request('https://maanasa.dev/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'resources/read',
        params: { uri: 'https://maanasa.dev/about' },
      }),
    });
    const readRes = await worker.fetch(readReq, {});
    expect(readRes.status).toBe(200);
    const readData = await readRes.json();
    expect(readData.result.contents[0].text.length).toBeGreaterThan(10);
  });

  it('validates OpenAPI 3.1.0 completeness: typed schemas, operationIds, Idempotency-Key, and versioning', () => {
    const openapi = JSON.parse(
      readFileSync(join(process.cwd(), 'public/openapi.json'), 'utf-8'),
    );
    expect(openapi.openapi).toBe('3.1.0');
    expect(openapi.info.title).toContain('Maanasa Narayan');
    expect(openapi.info.description).toContain(
      'Versioning & Deprecation Policy',
    );
    expect(openapi.servers.length).toBeGreaterThan(1);

    const paths = openapi.paths;
    const pathKeys = Object.keys(paths);
    expect(pathKeys.length).toBeGreaterThan(5);

    for (const p of pathKeys) {
      const methods = Object.keys(paths[p]);
      for (const m of methods) {
        const op = paths[p][m];
        expect(op.operationId).toBeDefined();
        expect(op.responses['200'] || op.responses['202']).toBeDefined();
      }
    }
  });

  it('validates robots.txt contains AI crawlers policy, Content-Signal, and Schemamap', () => {
    const robots = readFileSync(
      join(process.cwd(), 'public/robots.txt'),
      'utf-8',
    );
    expect(robots).toContain('GPTBot');
    expect(robots).toContain('ClaudeBot');
    expect(robots).toContain('Content-Signal:');
    expect(robots).toContain('Schemamap:');
  });
});
