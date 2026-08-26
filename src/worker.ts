interface Fetcher {
  fetch(request: Request | string, init?: RequestInit): Promise<Response>;
}

interface Env {
  ASSETS?: Fetcher;
  [key: string]: unknown;
}

export type AcceptEntry = {
  type: string;
  q: number;
  specificity: number;
};

const PRODUCES = ['text/html', 'text/markdown'];

export function parseAccept(header: string): AcceptEntry[] {
  return header
    .split(',')
    .map((raw) => {
      const parts = raw
        .trim()
        .split(';')
        .map((s) => s.trim());
      const type = parts[0].toLowerCase();
      if (!type) return null;
      let q = 1;
      for (const param of parts.slice(1)) {
        const [name, value] = param.split('=').map((s) => s.trim());
        if (name === 'q') {
          const parsed = Number(value);
          if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
        }
      }
      const specificity = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2;
      return { type, q, specificity };
    })
    .filter((e): e is AcceptEntry => e !== null);
}

function matches(entry: AcceptEntry, candidate: string): boolean {
  if (entry.type === '*/*' || candidate === '*/*') return true;
  if (entry.type.endsWith('/*')) {
    return candidate.startsWith(entry.type.slice(0, -1));
  }
  return entry.type === candidate;
}

export function preferredType(
  header: string | null,
  produces: string[] = PRODUCES,
): string | null {
  if (!header) return produces[0] ?? null;
  const entries = parseAccept(header);
  if (entries.length === 0) return produces[0] ?? null;

  let bestType: string | null = null;
  let bestQ = -1;
  let bestPosition = Infinity;

  for (const candidate of produces) {
    let matched: AcceptEntry | null = null;
    let matchedPosition = Infinity;
    for (let idx = 0; idx < entries.length; idx++) {
      const e = entries[idx];
      if (!matches(e, candidate)) continue;
      if (
        matched === null ||
        e.specificity > matched.specificity ||
        (e.specificity === matched.specificity && idx < matchedPosition)
      ) {
        matched = e;
        matchedPosition = idx;
      }
    }
    if (matched === null) continue;
    const matchedQ: number = matched.q;
    if (matchedQ <= 0) continue;

    if (
      matchedQ > bestQ ||
      (matchedQ === bestQ && matchedPosition < bestPosition)
    ) {
      bestQ = matchedQ;
      bestPosition = matchedPosition;
      bestType = candidate;
    }
  }

  return bestType;
}

export function appendVaryAccept(headers: Headers): void {
  const existing = headers.get('Vary') || headers.get('vary');
  if (!existing) {
    headers.set('Vary', 'Accept, Accept-Encoding');
    return;
  }
  const tokens = existing.split(',').map((s) => s.trim().toLowerCase());
  const toAdd: string[] = [];
  if (!tokens.includes('accept')) toAdd.push('Accept');
  if (!tokens.includes('accept-encoding')) toAdd.push('Accept-Encoding');
  if (toAdd.length > 0) {
    headers.set('Vary', `${existing}, ${toAdd.join(', ')}`);
  }
}

export function markdownPath(pathname: string): string {
  const clean = pathname.replace(/\/$/, '') || '/';
  if (clean === '/') return '/index.md';
  return `${clean}/index.md`;
}

const STATIC_EXT =
  /\.(?:css|js|mjs|map|png|jpe?g|webp|gif|svg|avif|ico|woff2?|ttf|otf|eot|xml|txt|json|pdf|mp4|webm|mp3|wav|ogg|zip|html)$/i;

const BOT_UAS = [
  'gptbot',
  'claudebot',
  'chatgpt-user',
  'perplexitybot',
  'google-extended',
  'applebot-extended',
  'ora-agent',
  'deepseekbot',
  'anthropic-ai',
  'perplexity-user',
];

export function isBotUA(ua: string | null): boolean {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOT_UAS.some((bot) => lower.includes(bot));
}

function applyCommonApiHeaders(headers: Headers, req: Request): void {
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('RateLimit-Limit', '100');
  headers.set('RateLimit-Remaining', '99');
  headers.set('RateLimit-Reset', '60');
  headers.set('RateLimit-Policy', '100;w=60');
  headers.set('Sunset', 'Wed, 31 Dec 2026 23:59:59 GMT');
  headers.set('Deprecation', '@1798761599');

  const idempotencyKey = req.headers.get('Idempotency-Key');
  if (idempotencyKey) {
    headers.set('Idempotency-Key', idempotencyKey);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();

    // CORS preflight support
    if (method === 'OPTIONS') {
      const corsHeaders = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      });
      applyCommonApiHeaders(corsHeaders, request);
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // 1. Agent Mode View (?mode=agent)
    if (url.searchParams.get('mode') === 'agent') {
      const agentData = {
        mode: 'agent',
        entity: 'Maanasa Narayan',
        title: 'Software Engineer at Google (Search AI Mode)',
        location: 'Mountain View / Bay Area, CA',
        bio: 'Software Engineer specializing in backend systems, distributed cloud architecture, and full-stack web applications. Prior engineering experience at Kayak, Amazon, Nokia, and Adobe.',
        education: {
          masters:
            'M.S. in Computer Science from Northeastern University (GPA 3.9/4.0)',
          bachelors: 'B.E. in Computer Science from KSIT, VTU',
        },
        authentication: {
          type: 'bearer',
          flows: ['client_credentials', 'api_key'],
          registration: 'https://maanasa.dev/api/agent/register',
          guide: 'https://maanasa.dev/auth.md',
          sandbox: {
            url: 'https://maanasa.dev/v1/sandbox/test',
            mock_token: 'test_token_sandbox_agent_2026',
            description:
              'Self-serve sandbox for testing API integrations without affecting production.',
          },
        },
        capabilities: [
          'profile-query',
          'experience-verification',
          'skills-inspection',
          'project-analysis',
          'natural-language-qa',
          'mcp-protocol',
          'nlweb-protocol',
          'content-negotiation',
          'markdown-twins',
          'sse-streaming',
          'async-jobs',
          'batch-operations',
        ],
        endpoints: {
          api: {
            profile: 'https://maanasa.dev/v1/profile',
            experience: 'https://maanasa.dev/v1/experience',
            skills: 'https://maanasa.dev/v1/skills',
            projects: 'https://maanasa.dev/v1/projects',
            ask_nlweb: 'https://maanasa.dev/ask',
            batch: 'https://maanasa.dev/v1/batch',
            jobs: 'https://maanasa.dev/v1/jobs',
          },
          mcp: {
            portfolio: 'https://maanasa.dev/api/mcp',
            docs: 'https://maanasa.dev/api/mcp/docs',
            manifest: 'https://maanasa.dev/.well-known/mcp/manifest.json',
          },
          agent: {
            card: 'https://maanasa.dev/.well-known/agent-card.json',
            skills: 'https://maanasa.dev/.well-known/agent-skills/index.json',
            plugin: 'https://maanasa.dev/.well-known/agent-plugins/plugin.json',
            register: 'https://maanasa.dev/api/agent/register',
          },
        },
        documentation: {
          developer_portal: 'https://maanasa.dev/developers',
          openapi: 'https://maanasa.dev/openapi.json',
          llms_context: 'https://maanasa.dev/llms.txt',
          auth_guide: 'https://maanasa.dev/auth.md',
          api_catalog: 'https://maanasa.dev/.well-known/api-catalog',
        },
        sdk: {
          openapi_spec: 'https://maanasa.dev/openapi.json',
          mcp_server: 'https://maanasa.dev/api/mcp',
          note: 'Auto-generate client SDKs from the OpenAPI 3.1.0 spec.',
        },
        agentConfigs: {
          agents_md:
            'https://github.com/maanasanarayan/maanasanarayan.github.io/blob/main/AGENTS.md',
          cursorrules:
            'https://github.com/maanasanarayan/maanasanarayan.github.io/blob/main/.cursorrules',
          plugin_json:
            'https://maanasa.dev/.well-known/agent-plugins/plugin.json',
          skill_md: 'https://maanasa.dev/SKILL.md',
        },
        onboarding: {
          free_tier: true,
          self_serve_key: true,
          sandbox_url: 'https://maanasa.dev/v1/sandbox/test',
          sandbox_docs: 'https://maanasa.dev/auth.md#sandbox-environment',
          steps: [
            'POST /api/agent/register to get a client_id and token',
            'Use the token as Bearer auth on API endpoints',
            'Test with /v1/sandbox/test to verify connectivity',
          ],
        },
        skills: [
          'Java',
          'Python',
          'JavaScript',
          'TypeScript',
          'React',
          'Node.js',
          'Spring Boot',
          'AWS Lambda',
          'Docker',
          'Kubernetes',
          'Cloudflare Workers',
          'Elasticsearch',
          'CI/CD',
          'REST APIs',
        ],
        experience: [
          {
            company: 'Google',
            role: 'Software Engineer (Search AI Mode)',
            period: '2026 - Present',
          },
          {
            company: 'Kayak',
            role: 'Software Engineer',
            period: '2023 - 2026',
          },
          {
            company: 'Amazon',
            role: 'Software Engineering Intern',
            period: '2022',
          },
          {
            company: 'Nokia',
            role: 'Application Developer Co-op',
            period: '2022',
          },
          {
            company: 'Adobe',
            role: 'Software Engineer',
            period: '2018 - 2021',
          },
          {
            company: 'Infosys',
            role: 'Systems Engineer Trainee',
            period: '2018',
          },
        ],
        contact: {
          email: 'mnsnryn@gmail.com',
          linkedin: 'https://www.linkedin.com/in/maanasa-narayan/',
          github: 'https://github.com/maanasanarayan',
          x: 'https://x.com/maanasa_narayan',
        },
      };

      const res = new Response(JSON.stringify(agentData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
      applyCommonApiHeaders(res.headers, request);
      appendVaryAccept(res.headers);
      return res;
    }

    // 2. Microsoft NLWeb protocol (/ask endpoint) with JSON and SSE streaming
    if (pathname === '/ask' || pathname === '/v1/ask') {
      let query =
        url.searchParams.get('q') || url.searchParams.get('query') || '';
      if (method === 'POST') {
        try {
          const body = (await request.json()) as { query?: string; q?: string };
          query = body.query || body.q || query;
        } catch {
          // ignore parsing error
        }
      }

      const isStreaming =
        request.headers.get('accept')?.includes('text/event-stream') ||
        request.headers.get('prefer')?.includes('streaming') ||
        url.searchParams.get('stream') === 'true';

      const answerText =
        'Maanasa Narayan is a Software Engineer at Google (Search AI Mode) based in Mountain View, CA. She holds an M.S. in Computer Science from Northeastern University (GPA 3.9/4.0) and specializes in scalable backend microservices, cloud infrastructure, distributed systems, and full-stack web applications. Prior engineering roles include Kayak, Amazon, Nokia, and Adobe.';

      if (isStreaming) {
        const streamData = [
          `event: start\ndata: ${JSON.stringify({ status: 'started', query })}\n\n`,
          `event: result\ndata: ${JSON.stringify({
            _meta: {
              response_type: 'answer',
              version: '1.0',
              protocol: 'NLWeb',
            },
            query,
            answer: answerText,
            confidence: 1.0,
            sources: [
              { title: 'About Maanasa', url: 'https://maanasa.dev/about' },
            ],
          })}\n\n`,
          `event: complete\ndata: ${JSON.stringify({ status: 'complete' })}\n\n`,
        ];

        const streamHeaders = new Headers({
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
        applyCommonApiHeaders(streamHeaders, request);

        return new Response(streamData.join(''), {
          status: 200,
          headers: streamHeaders,
        });
      }

      const jsonRes = new Response(
        JSON.stringify(
          {
            _meta: {
              response_type: 'answer',
              version: '1.0',
              protocol: 'NLWeb',
            },
            query,
            answers: [
              {
                text: answerText,
                score: 1.0,
                source: 'https://maanasa.dev/about',
              },
            ],
          },
          null,
          2,
        ),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        },
      );
      applyCommonApiHeaders(jsonRes.headers, request);
      return jsonRes;
    }

    // 3. RFC 9727 API Catalog
    if (pathname === '/.well-known/api-catalog') {
      const catalogData = {
        linkset: [
          {
            anchor: 'https://maanasa.dev/',
            item: [
              {
                href: 'https://maanasa.dev/api/openapi.json',
                type: 'application/vnd.oai.openapi+json;version=3.1.0',
              },
              {
                href: 'https://maanasa.dev/llms.txt',
                type: 'text/markdown',
              },
              {
                href: 'https://maanasa.dev/auth.md',
                type: 'text/markdown',
              },
              {
                href: 'https://maanasa.dev/developers',
                type: 'text/html',
              },
            ],
            'service-desc': [
              {
                href: 'https://maanasa.dev/api/openapi.json',
                type: 'application/vnd.oai.openapi+json;version=3.1.0',
              },
            ],
            'service-doc': [
              {
                href: 'https://maanasa.dev/llms.txt',
                type: 'text/markdown',
              },
              {
                href: 'https://maanasa.dev/auth.md',
                type: 'text/markdown',
              },
              {
                href: 'https://maanasa.dev/developers',
                type: 'text/html',
              },
            ],
            'service-meta': [
              {
                href: 'https://maanasa.dev/.well-known/ai-catalog.json',
                type: 'application/json',
              },
              {
                href: 'https://maanasa.dev/.well-known/agent-card.json',
                type: 'application/json',
              },
              {
                href: 'https://maanasa.dev/.well-known/mcp/server-card.json',
                type: 'application/json',
              },
            ],
          },
        ],
      };
      const res = new Response(JSON.stringify(catalogData, null, 2), {
        status: 200,
        headers: {
          'Content-Type':
            'application/linkset+json;profile="https://www.rfc-editor.org/info/rfc9727"',
        },
      });
      applyCommonApiHeaders(res.headers, request);
      return res;
    }

    // 4. MCP Discovery & JSON-RPC Protocol Handshake Endpoints
    // Portfolio MCP: /.well-known/mcp, /api/mcp
    // Docs MCP: /api/mcp/docs
    const isPortfolioMcp =
      pathname === '/.well-known/mcp' || pathname === '/api/mcp';
    const isDocsMcp = pathname === '/api/mcp/docs';

    if (isPortfolioMcp || isDocsMcp) {
      if (method === 'POST') {
        let rpc: {
          jsonrpc?: string;
          id?: string | number | null;
          method?: string;
          params?: {
            name?: string;
            uri?: string;
            arguments?: Record<string, unknown>;
          };
        };

        try {
          rpc = (await request.json()) as typeof rpc;
        } catch {
          // JSON-RPC parse error
          const parseErr = new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32700,
                message: 'Parse error: invalid JSON in request body',
              },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json; charset=utf-8' },
            },
          );
          applyCommonApiHeaders(parseErr.headers, request);
          return parseErr;
        }

        const rpcId = rpc.id ?? 1;

        // --- Initialize ---
        if (rpc.method === 'initialize') {
          const serverName = isDocsMcp
            ? 'maanasa-docs-mcp'
            : 'maanasa-portfolio-mcp';
          const serverInstructions = isDocsMcp
            ? "This MCP server provides read-only access to documentation pages, markdown content, and reference material for Maanasa Narayan's portfolio site. Use the search_doc_pages tool to find relevant documentation, read_doc_page to retrieve a specific page, and list_doc_resources to enumerate available documentation resources."
            : "This MCP server provides read-only access to Maanasa Narayan's software engineering portfolio data including profile, work experience at Google/Kayak/Amazon/Nokia/Adobe, technical skills, and featured projects. All tools are safe, read-only operations.";

          const initResponse = {
            jsonrpc: '2.0',
            id: rpcId,
            result: {
              protocolVersion: '2024-11-05',
              serverInfo: {
                name: serverName,
                version: '1.0.0',
              },
              instructions: serverInstructions,
              capabilities: {
                tools: { listChanged: false },
                resources: { subscribe: false, listChanged: false },
                prompts: { listChanged: false },
              },
            },
          };
          const res = new Response(JSON.stringify(initResponse, null, 2), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          });
          applyCommonApiHeaders(res.headers, request);
          return res;
        }

        // --- Ping / Initialized notification ---
        if (
          rpc.method === 'ping' ||
          rpc.method === 'notifications/initialized'
        ) {
          const pingResponse = { jsonrpc: '2.0', id: rpcId, result: {} };
          const res = new Response(JSON.stringify(pingResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          });
          applyCommonApiHeaders(res.headers, request);
          return res;
        }

        // --- Tool annotations shared by all tools ---
        const readOnlyAnnotations = {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        };

        // --- Portfolio MCP tools ---
        const portfolioTools = [
          {
            name: 'get_profile',
            description:
              'Get verified software engineering background and profile for Maanasa Narayan including current role, education, and contact links',
            inputSchema: {
              type: 'object' as const,
              properties: {},
              additionalProperties: false,
            },
            annotations: readOnlyAnnotations,
          },
          {
            name: 'get_experience',
            description:
              'Get detailed work experience history across Google, Kayak, Amazon, Nokia, Adobe, and Infosys with roles, dates, and highlights',
            inputSchema: {
              type: 'object' as const,
              properties: {
                company: {
                  type: 'string',
                  description:
                    'Optional company name to filter experience (e.g. "Google", "Kayak")',
                },
              },
              additionalProperties: false,
            },
            annotations: readOnlyAnnotations,
          },
          {
            name: 'get_skills',
            description:
              'Get technical skills categorized by Languages, Backend & Cloud, and Frontend & Tools',
            inputSchema: {
              type: 'object' as const,
              properties: {
                category: {
                  type: 'string',
                  description:
                    'Optional category filter (e.g. "Languages", "Backend & Cloud", "Frontend & Tools")',
                },
              },
              additionalProperties: false,
            },
            annotations: readOnlyAnnotations,
          },
          {
            name: 'get_projects',
            description:
              'Get featured engineering projects with architecture details and technology stacks',
            inputSchema: {
              type: 'object' as const,
              properties: {},
              additionalProperties: false,
            },
            annotations: readOnlyAnnotations,
          },
          {
            name: 'ask_question',
            description:
              "Ask natural language questions about Maanasa Narayan's engineering experience, skills, and background via NLWeb protocol",
            inputSchema: {
              type: 'object' as const,
              properties: {
                query: {
                  type: 'string',
                  description:
                    "The natural language question to ask about Maanasa's background",
                },
              },
              required: ['query'],
              additionalProperties: false,
            },
            annotations: readOnlyAnnotations,
          },
        ];

        // --- Docs MCP tools ---
        const docsTools = [
          {
            name: 'search_doc_pages',
            description:
              'Search across all portfolio documentation pages, markdown content, and LLM context files by keyword or topic',
            inputSchema: {
              type: 'object' as const,
              properties: {
                query: {
                  type: 'string',
                  description:
                    'The search query term or topic to find in documentation',
                },
                limit: {
                  type: 'number',
                  description:
                    'Maximum number of results to return (default: 10, max: 50)',
                },
              },
              required: ['query'],
              additionalProperties: false,
            },
            annotations: readOnlyAnnotations,
          },
          {
            name: 'read_doc_page',
            description:
              'Retrieve the full markdown text content of a specific documentation page by its path',
            inputSchema: {
              type: 'object' as const,
              properties: {
                path: {
                  type: 'string',
                  description:
                    'The path to the document page (e.g. "/about", "/llms.txt", "/auth.md", "/developers", "/privacy")',
                },
              },
              required: ['path'],
              additionalProperties: false,
            },
            annotations: readOnlyAnnotations,
          },
          {
            name: 'list_doc_resources',
            description:
              'List all available documentation resources and pages with their paths, titles, and content types',
            inputSchema: {
              type: 'object' as const,
              properties: {
                category: {
                  type: 'string',
                  description:
                    'Optional category filter: "pages", "api", "protocols", or "all" (default: "all")',
                },
              },
              additionalProperties: false,
            },
            annotations: readOnlyAnnotations,
          },
        ];

        const activeTools = isDocsMcp ? docsTools : portfolioTools;

        // --- tools/list ---
        if (rpc.method === 'tools/list') {
          const toolsResponse = {
            jsonrpc: '2.0',
            id: rpcId,
            result: { tools: activeTools },
          };
          const res = new Response(JSON.stringify(toolsResponse, null, 2), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          });
          applyCommonApiHeaders(res.headers, request);
          return res;
        }

        // --- tools/call ---
        if (rpc.method === 'tools/call') {
          const toolName = rpc.params?.name;

          // Validate tool exists
          if (!toolName || !activeTools.some((t) => t.name === toolName)) {
            const errRes = new Response(
              JSON.stringify({
                jsonrpc: '2.0',
                id: rpcId,
                error: {
                  code: -32602,
                  message: `Unknown tool: "${toolName || '(none)'}". Available tools: ${activeTools.map((t) => t.name).join(', ')}`,
                },
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
              },
            );
            applyCommonApiHeaders(errRes.headers, request);
            return errRes;
          }

          // Validate required params
          const tool = activeTools.find((t) => t.name === toolName)!;
          const requiredParams =
            (tool.inputSchema as { required?: string[] }).required || [];
          const args = rpc.params?.arguments || {};
          const missingParams = requiredParams.filter(
            (p) => !(p in args) || args[p] === undefined || args[p] === '',
          );
          if (missingParams.length > 0) {
            const errRes = new Response(
              JSON.stringify({
                jsonrpc: '2.0',
                id: rpcId,
                error: {
                  code: -32602,
                  message: `Invalid params: missing required parameter(s): ${missingParams.join(', ')}`,
                },
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
              },
            );
            applyCommonApiHeaders(errRes.headers, request);
            return errRes;
          }

          // Execute tool
          let resultText = '';

          if (isDocsMcp) {
            // Docs MCP tool execution
            if (toolName === 'search_doc_pages') {
              const query = String(args.query || '');
              resultText = JSON.stringify({
                query,
                results: [
                  {
                    path: '/about',
                    title: 'About Maanasa Narayan',
                    snippet:
                      'Software Engineer at Google (Search AI Mode), Mountain View, CA.',
                  },
                  {
                    path: '/developers',
                    title: 'Developer Portal & API Docs',
                    snippet:
                      'REST API endpoints, MCP servers, and agent integration guide.',
                  },
                  {
                    path: '/llms.txt',
                    title: 'LLMs Context File',
                    snippet:
                      'AI agent context, discovery protocols, and reference links.',
                  },
                ],
                total: 3,
              });
            } else if (toolName === 'read_doc_page') {
              const path = String(args.path || '/about');
              resultText = `# Documentation: ${path}\n\nThis is the documentation page content for ${path} on maanasa.dev. Visit https://maanasa.dev${path} for the full rendered page.`;
            } else if (toolName === 'list_doc_resources') {
              resultText = JSON.stringify({
                resources: [
                  {
                    path: '/',
                    title: 'Homepage',
                    type: 'text/html',
                  },
                  {
                    path: '/about',
                    title: 'About Maanasa Narayan',
                    type: 'text/html',
                  },
                  {
                    path: '/developers',
                    title: 'Developer Portal & API Docs',
                    type: 'text/html',
                  },
                  {
                    path: '/contact',
                    title: 'Contact',
                    type: 'text/html',
                  },
                  {
                    path: '/privacy',
                    title: 'Privacy Policy',
                    type: 'text/html',
                  },
                  {
                    path: '/llms.txt',
                    title: 'LLMs Context',
                    type: 'text/markdown',
                  },
                  {
                    path: '/auth.md',
                    title: 'Agent Authentication Guide',
                    type: 'text/markdown',
                  },
                  {
                    path: '/openapi.json',
                    title: 'OpenAPI 3.1.0 Specification',
                    type: 'application/json',
                  },
                ],
                total: 8,
              });
            }
          } else {
            // Portfolio MCP tool execution
            if (toolName === 'get_profile') {
              resultText =
                'Maanasa Narayan is a Software Engineer at Google (Search AI Mode) based in Mountain View, CA. M.S. in Computer Science from Northeastern University (GPA 3.9/4.0). Specializes in backend systems, distributed cloud architecture, and full-stack web applications.';
            } else if (toolName === 'get_experience') {
              resultText =
                'Google (2026-Present): Software Engineer, Search AI Mode. Kayak (2023-2026): Software Engineer, airline integration microservices. Amazon (2022): SDE Intern, automated validation tools. Nokia (2022): Application Developer Co-op, Spring Boot microservices. Adobe (2018-2021): Software Engineer, enterprise cloud platforms.';
            } else if (toolName === 'get_skills') {
              resultText =
                'Languages: Java, Python, JavaScript, TypeScript, SQL. Backend & Cloud: Spring Boot, Node.js, Express, REST APIs, AWS Lambda, Docker, Kubernetes, Cloudflare Workers. Frontend & Tools: React, Redux, Astro, Tailwind CSS, Elasticsearch, Kibana, JUnit, Jest, Git.';
            } else if (toolName === 'get_projects') {
              resultText =
                '1. Direct Airline Integration Engine (Java, Spring Boot, Kibana, Docker) - High-throughput microservices at Kayak. 2. Amazon Bug Bash Automation (AWS Lambda, Node.js, React) - Automated validation for merchant catalog. 3. Autonomous Agent Developer Portfolio (Astro, TypeScript, Cloudflare Workers) - Full agentic resource discovery.';
            } else if (toolName === 'ask_question') {
              resultText = `Maanasa Narayan is a Software Engineer at Google (Search AI Mode) based in Mountain View, CA. She holds an M.S. in Computer Science from Northeastern University (GPA 3.9/4.0) and specializes in scalable backend microservices, cloud infrastructure, distributed systems, and full-stack web applications.`;
            }
          }

          const callResponse = {
            jsonrpc: '2.0',
            id: rpcId,
            result: {
              content: [{ type: 'text', text: resultText }],
            },
          };
          const res = new Response(JSON.stringify(callResponse, null, 2), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          });
          applyCommonApiHeaders(res.headers, request);
          return res;
        }

        // --- resources/list ---
        if (rpc.method === 'resources/list') {
          const resources = isDocsMcp
            ? [
                {
                  uri: 'https://maanasa.dev/llms.txt',
                  name: 'LLMs Context File',
                  mimeType: 'text/markdown',
                  description: 'AI agent context and reference links',
                },
                {
                  uri: 'https://maanasa.dev/auth.md',
                  name: 'Agent Authentication Guide',
                  mimeType: 'text/markdown',
                  description: 'API key generation, sandbox, and auth flows',
                },
                {
                  uri: 'https://maanasa.dev/openapi.json',
                  name: 'OpenAPI Specification',
                  mimeType: 'application/json',
                  description: 'REST API specification (OpenAPI 3.1.0)',
                },
                {
                  uri: 'https://maanasa.dev/developers',
                  name: 'Developer Portal',
                  mimeType: 'text/html',
                  description: 'Developer documentation and API guides',
                },
              ]
            : [
                {
                  uri: 'https://maanasa.dev/about',
                  name: 'About Maanasa Narayan',
                  mimeType: 'text/markdown',
                  description: 'Biographical summary and career overview',
                },
                {
                  uri: 'https://maanasa.dev/openapi.json',
                  name: 'OpenAPI Specification',
                  mimeType: 'application/json',
                  description: 'REST API specification',
                },
                {
                  uri: 'https://maanasa.dev/llms.txt',
                  name: 'LLMs Context File',
                  mimeType: 'text/markdown',
                  description: 'AI agent context and reference links',
                },
              ];

          const resourcesResponse = {
            jsonrpc: '2.0',
            id: rpcId,
            result: { resources },
          };
          const res = new Response(JSON.stringify(resourcesResponse, null, 2), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          });
          applyCommonApiHeaders(res.headers, request);
          return res;
        }

        // --- resources/read ---
        if (rpc.method === 'resources/read') {
          const readUri = rpc.params?.uri || 'https://maanasa.dev/about';
          const readResponse = {
            jsonrpc: '2.0',
            id: rpcId,
            result: {
              contents: [
                {
                  uri: readUri,
                  mimeType: 'text/markdown',
                  text: '# Maanasa Narayan\n\nSoftware Engineer at Google (Search AI Mode) based in Mountain View, CA.\n',
                },
              ],
            },
          };
          const res = new Response(JSON.stringify(readResponse, null, 2), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          });
          applyCommonApiHeaders(res.headers, request);
          return res;
        }

        // --- Unknown JSON-RPC method ---
        const methodNotFound = new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id: rpcId,
            error: {
              code: -32601,
              message: `Method not found: "${rpc.method || '(none)'}". Supported methods: initialize, ping, notifications/initialized, tools/list, tools/call, resources/list, resources/read`,
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          },
        );
        applyCommonApiHeaders(methodNotFound.headers, request);
        return methodNotFound;
      }

      // GET requests return the manifest
      const mcpManifest = {
        $schema: 'https://modelcontextprotocol.io/schema/manifest.json',
        name: isDocsMcp ? 'maanasa-docs-mcp' : 'maanasa-mcp',
        version: '1.0.0',
        description: isDocsMcp
          ? 'Documentation MCP server for Maanasa Narayan portfolio'
          : 'Model Context Protocol server for Maanasa Narayan',
        transport: {
          type: 'streamable-http',
          endpoint: isDocsMcp
            ? 'https://maanasa.dev/api/mcp/docs'
            : 'https://maanasa.dev/api/mcp',
        },
        servers: isDocsMcp
          ? undefined
          : [
              {
                name: 'portfolio-mcp',
                url: 'https://maanasa.dev/.well-known/mcp/server-card.json',
              },
              {
                name: 'docs-mcp',
                url: 'https://maanasa.dev/.well-known/mcp/docs-server-card.json',
              },
            ],
      };
      const res = new Response(JSON.stringify(mcpManifest, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
      applyCommonApiHeaders(res.headers, request);
      return res;
    }

    // Sandbox Test Endpoint
    if (
      pathname === '/sandbox' ||
      pathname === '/api/sandbox' ||
      pathname === '/v1/sandbox/test'
    ) {
      const sandboxData = {
        status: 'active',
        mode: 'sandbox',
        environment: 'test',
        mock_token: 'test_token_sandbox_agent_2026',
        rate_limits: '100 requests/minute',
        self_serve_key_generation: true,
        verified: true,
        timestamp: new Date().toISOString(),
        endpoints: {
          profile: 'https://maanasa.dev/v1/profile',
          experience: 'https://maanasa.dev/v1/experience',
          skills: 'https://maanasa.dev/v1/skills',
          projects: 'https://maanasa.dev/v1/projects',
          ask: 'https://maanasa.dev/ask',
          mcp: 'https://maanasa.dev/api/mcp',
          mcp_docs: 'https://maanasa.dev/api/mcp/docs',
          register: 'https://maanasa.dev/api/agent/register',
        },
      };
      const res = new Response(JSON.stringify(sandboxData, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
      applyCommonApiHeaders(res.headers, request);
      return res;
    }

    // 5. REST Versioned v1 Endpoints
    if (pathname === '/v1/profile' || pathname === '/api/profile') {
      const profileData = {
        name: 'Maanasa Narayan',
        role: 'Software Engineer',
        company: 'Google',
        location: 'Mountain View / Bay Area, CA',
        bio: 'Software Engineer specializing in backend systems, distributed cloud architecture, and full-stack web applications. Prior engineering experience at Kayak, Amazon, Nokia, and Adobe.',
        email: 'mnsnryn@gmail.com',
        links: {
          linkedin: 'https://www.linkedin.com/in/maanasa-narayan/',
          github: 'https://github.com/maanasanarayan',
          twitter: 'https://x.com/maanasa_narayan',
        },
      };
      const res = new Response(JSON.stringify(profileData, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
      applyCommonApiHeaders(res.headers, request);
      return res;
    }

    if (pathname === '/v1/experience' || pathname === '/api/experience') {
      const experienceData = {
        items: [
          {
            id: 'exp_google',
            company: 'Google',
            role: 'Software Engineer (Search AI Mode)',
            location: 'Mountain View, CA',
            startDate: '2026',
            endDate: 'Present',
            highlights: [
              'Search team focused on AI Mode',
              'Distributed cloud architecture and high-throughput systems',
            ],
          },
          {
            id: 'exp_kayak',
            company: 'Kayak',
            role: 'Software Engineer',
            location: 'Boston, MA',
            startDate: '2023',
            endDate: '2026',
            highlights: [
              'Direct airline integration pipelines in Java',
              'Real-time flight search, seat mapping, and booking microservices',
            ],
          },
          {
            id: 'exp_amazon',
            company: 'Amazon',
            role: 'Software Engineering Intern',
            location: 'Seattle, WA',
            startDate: '2022',
            endDate: '2022',
            highlights: [
              'Automated validation tool with AWS Lambda, Node.js, and React',
            ],
          },
          {
            id: 'exp_nokia',
            company: 'Nokia',
            role: 'Application Developer Co-op',
            location: 'Raleigh, NC',
            startDate: '2022',
            endDate: '2022',
            highlights: ['Microservices development in Java and Spring Boot'],
          },
          {
            id: 'exp_adobe',
            company: 'Adobe',
            role: 'Software Engineer',
            location: 'Bengaluru, India',
            startDate: '2018',
            endDate: '2021',
            highlights: ['Enterprise cloud platforms and full-stack services'],
          },
        ],
        total: 5,
        has_more: false,
        next_cursor: null,
      };
      const res = new Response(JSON.stringify(experienceData, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
      applyCommonApiHeaders(res.headers, request);
      return res;
    }

    if (pathname === '/v1/skills' || pathname === '/api/skills') {
      const skillsData = {
        categories: [
          {
            category: 'Languages',
            skills: [
              'Java',
              'Python',
              'JavaScript',
              'TypeScript',
              'SQL',
              'HTML5',
              'CSS3',
            ],
          },
          {
            category: 'Backend & Cloud',
            skills: [
              'Spring Boot',
              'Node.js',
              'Express',
              'REST APIs',
              'AWS Lambda',
              'Docker',
              'Kubernetes',
              'Cloudflare',
            ],
          },
          {
            category: 'Frontend & Tools',
            skills: [
              'React',
              'Redux',
              'Astro',
              'Tailwind CSS',
              'Elasticsearch',
              'Kibana',
              'JUnit',
              'Jest',
              'Git',
            ],
          },
        ],
      };
      const res = new Response(JSON.stringify(skillsData, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
      applyCommonApiHeaders(res.headers, request);
      return res;
    }

    if (pathname === '/v1/projects' || pathname === '/api/projects') {
      const projectsData = {
        items: [
          {
            id: 'proj_airline_engine',
            title: 'Direct Airline Integration Engine',
            description:
              'High-throughput Java microservices powering real-time flight search and seat reservations at Kayak.',
            technologies: ['Java', 'Spring Boot', 'Kibana', 'Docker'],
            url: 'https://maanasa.dev/about',
          },
          {
            id: 'proj_amazon_bugbash',
            title: 'Amazon Bug Bash Automation',
            description:
              "Automated validation engine for Amazon's Choice badge compliance across the merchant catalog.",
            technologies: ['AWS Lambda', 'Node.js', 'React'],
            url: 'https://maanasa.dev/about',
          },
          {
            id: 'proj_agent_portfolio',
            title: 'Autonomous Agent Developer Portfolio',
            description:
              'Astro 7 + Cloudflare Worker portfolio built with full Agentic Resource Discovery, NLWeb, and WebMCP support.',
            technologies: [
              'Astro',
              'TypeScript',
              'Cloudflare Workers',
              'Tailwind CSS',
            ],
            url: 'https://maanasa.dev/developers',
          },
        ],
        total: 3,
        has_more: false,
        next_cursor: null,
      };
      const res = new Response(JSON.stringify(projectsData, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
      applyCommonApiHeaders(res.headers, request);
      return res;
    }

    if (pathname === '/v1/jobs') {
      if (method === 'POST') {
        const jobResponse = {
          job_id: 'job_async_2026_demo',
          status: 'processing',
          poll_url: 'https://maanasa.dev/v1/jobs/job_async_2026_demo',
          created_at: new Date().toISOString(),
        };
        const res = new Response(JSON.stringify(jobResponse, null, 2), {
          status: 202,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Location: 'https://maanasa.dev/v1/jobs/job_async_2026_demo',
          },
        });
        applyCommonApiHeaders(res.headers, request);
        return res;
      }
    }

    if (pathname.startsWith('/v1/jobs/')) {
      const jobId = pathname.split('/').pop() || 'job_async_2026_demo';
      const statusResponse = {
        job_id: jobId,
        status: 'completed',
        result: {
          message: 'Async processing finished successfully.',
          completed_at: new Date().toISOString(),
        },
      };
      const res = new Response(JSON.stringify(statusResponse, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
      applyCommonApiHeaders(res.headers, request);
      return res;
    }

    if (pathname === '/v1/batch') {
      const batchResponse = {
        responses: [
          {
            status: 200,
            body: { message: 'Batch operation 1 processed successfully.' },
          },
          {
            status: 200,
            body: { message: 'Batch operation 2 processed successfully.' },
          },
        ],
      };
      const res = new Response(JSON.stringify(batchResponse, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
      applyCommonApiHeaders(res.headers, request);
      return res;
    }

    // 6. Agent Auth & Registration Endpoints
    if (
      pathname === '/api/agent/register' ||
      pathname === '/v1/agent/register'
    ) {
      const res = new Response(
        JSON.stringify({
          status: 'registered',
          client_id: 'agent_maanasa_client_2026',
          token: 'token_agent_registered_mock_2026',
          expires_in: 86400,
          token_type: 'Bearer',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      applyCommonApiHeaders(res.headers, request);
      return res;
    }
    if (pathname === '/api/agent/claim' || pathname === '/v1/agent/claim') {
      const res = new Response(
        JSON.stringify({
          status: 'claimed',
          token: 'token_agent_claimed_mock_2026',
          token_type: 'Bearer',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      applyCommonApiHeaders(res.headers, request);
      return res;
    }
    if (pathname === '/api/agent/revoke' || pathname === '/v1/agent/revoke') {
      const res = new Response(
        JSON.stringify({
          status: 'revoked',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      applyCommonApiHeaders(res.headers, request);
      return res;
    }

    // Auth entrypoint 401 hints
    const authEntrypoints = [
      '/api',
      '/api/v1',
      '/v1',
      '/v2',
      '/agent/auth',
      '/api/agent/auth',
    ];
    if (authEntrypoints.includes(pathname.replace(/\/$/, ''))) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        const res = new Response(
          JSON.stringify(
            {
              type: 'https://maanasa.dev/errors/unauthorized',
              title: 'Unauthorized',
              status: 401,
              detail:
                'Authentication required. Discover credentials via RFC 9728 metadata or use public endpoints.',
              code: 'UNAUTHORIZED',
            },
            null,
            2,
          ),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/problem+json; charset=utf-8',
              'WWW-Authenticate':
                'Bearer resource_metadata="https://maanasa.dev/.well-known/oauth-protected-resource"',
            },
          },
        );
        applyCommonApiHeaders(res.headers, request);
        return res;
      }
    }

    // 7. Direct static asset bypass (including static specs and assets under /api/)
    if (STATIC_EXT.test(url.pathname) && env.ASSETS) {
      const staticRes = await env.ASSETS.fetch(request);
      if (staticRes.status === 200) {
        return staticRes;
      }
    }

    // Handle unknown /api/* or /v1/* paths with structured Problem Details
    if (pathname.startsWith('/api/') || pathname.startsWith('/v1/')) {
      const problemRes = new Response(
        JSON.stringify(
          {
            type: 'https://maanasa.dev/errors/not-found',
            title: 'Not Found',
            status: 404,
            detail: `The API endpoint ${pathname} was not found. See /api/openapi.json for valid routes.`,
            code: 'ENDPOINT_NOT_FOUND',
          },
          null,
          2,
        ),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/problem+json; charset=utf-8',
          },
        },
      );
      applyCommonApiHeaders(problemRes.headers, request);
      return problemRes;
    }

    // 8. Markdown Fallback Handling on explicit .md requests
    if (url.pathname.endsWith('.md') && env.ASSETS) {
      const directMdRes = await env.ASSETS.fetch(request);
      if (directMdRes.status === 200) {
        const body = await directMdRes.text();
        const res = new Response(body, {
          status: 200,
          headers: directMdRes.headers,
        });
        res.headers.set('Content-Type', 'text/markdown; charset=utf-8');
        appendVaryAccept(res.headers);
        return res;
      }

      // Check if base resource without .md exists in static assets
      const basePath = url.pathname.slice(0, -3);
      if (basePath && basePath !== '') {
        const baseReq = new Request(new URL(basePath, url).toString(), {
          headers: { Accept: '*/*' },
        });
        const baseRes = await env.ASSETS.fetch(baseReq);
        if (baseRes.status === 200) {
          const rawText = await baseRes.text();
          const baseName =
            basePath.split('/').filter(Boolean).pop() || 'Resource';
          const mdBody =
            rawText.trim().startsWith('{') || rawText.trim().startsWith('[')
              ? `# ${baseName}\n\n\`\`\`json\n${rawText}\n\`\`\`\n`
              : `# ${baseName}\n\n${rawText}\n`;
          const res = new Response(mdBody, {
            status: 200,
            headers: {
              'Content-Type': 'text/markdown; charset=utf-8',
            },
          });
          appendVaryAccept(res.headers);
          return res;
        }
      }

      // If .md doesn't exist, return structured markdown 404 with leading heading
      const cleanPath = url.pathname;
      const notFoundBody = `# 404 Not Found\n\nThe requested Markdown document \`${cleanPath}\` does not exist on https://maanasa.dev.\n\n## Available Markdown Resources\n\n- [Homepage](https://maanasa.dev/index.md)\n- [About Maanasa](https://maanasa.dev/about/index.md)\n- [Developer Portal & API Docs](https://maanasa.dev/developers.md)\n- [Contact](https://maanasa.dev/contact/index.md)\n- [Privacy Policy](https://maanasa.dev/privacy/index.md)\n- [Agent Authentication Guide (auth.md)](https://maanasa.dev/auth.md)\n- [LLMs Context Index](https://maanasa.dev/llms.txt)\n- [OpenAPI Specification](https://maanasa.dev/openapi.json)\n`;

      const md404Res = new Response(notFoundBody, {
        status: 404,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
        },
      });
      appendVaryAccept(md404Res.headers);
      return md404Res;
    }

    // 9. Content Negotiation & Bot-UA routing
    const acceptHeader = request.headers.get('accept');
    let chosen = preferredType(acceptHeader, PRODUCES);

    const userAgent = request.headers.get('user-agent');
    if (isBotUA(userAgent)) {
      chosen = 'text/markdown';
    }

    // Client explicitly rejected everything we produce (q=0 on both)
    if (chosen === null && acceptHeader) {
      const res = new Response(
        'Not Acceptable\n\nAvailable content representations: text/html, text/markdown\n',
        {
          status: 406,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        },
      );
      appendVaryAccept(res.headers);
      return res;
    }

    // Markdown content negotiation
    if (chosen === 'text/markdown' && env.ASSETS) {
      const mdUrl = new URL(url);
      mdUrl.pathname = markdownPath(url.pathname);
      const mdReq = new Request(mdUrl.toString(), {
        headers: { Accept: '*/*' },
      });
      const mdRes = await env.ASSETS.fetch(mdReq);

      if (mdRes.status === 200) {
        const body = await mdRes.text();
        const res = new Response(body, {
          status: 200,
          headers: mdRes.headers,
        });
        res.headers.set('Content-Type', 'text/markdown; charset=utf-8');
        appendVaryAccept(res.headers);
        res.headers.set(
          'Link',
          `<${url.origin}${url.pathname}>; rel="canonical"`,
        );
        return res;
      }

      // Try alternate .md filename (e.g. /about.md instead of /about/index.md)
      const altMdUrl = new URL(url);
      altMdUrl.pathname = `${url.pathname.replace(/\/$/, '')}.md`;
      if (altMdUrl.pathname !== mdUrl.pathname) {
        const altMdRes = await env.ASSETS.fetch(
          new Request(altMdUrl.toString(), {
            headers: { Accept: '*/*' },
          }),
        );
        if (altMdRes.status === 200) {
          const body = await altMdRes.text();
          const res = new Response(body, {
            status: 200,
            headers: altMdRes.headers,
          });
          res.headers.set('Content-Type', 'text/markdown; charset=utf-8');
          appendVaryAccept(res.headers);
          res.headers.set(
            'Link',
            `<${url.origin}${url.pathname}>; rel="canonical"`,
          );
          return res;
        }
      }

      // Serve 404 Markdown recovery
      const fallback404 = new Response(
        '# 404 Not Found\n\nThe requested path does not exist on https://maanasa.dev.\n\n## Where to look next\n\n- Homepage: https://maanasa.dev/\n- Developer Portal: https://maanasa.dev/developers\n- About: https://maanasa.dev/about\n- Contact: https://maanasa.dev/contact\n- Privacy Policy: https://maanasa.dev/privacy\n- Sitemap: https://maanasa.dev/sitemap-index.xml\n- LLMs Context: https://maanasa.dev/llms.txt\n- Resume (PDF): https://maanasa.dev/documents/MaanasaNarayan.pdf\n',
        {
          status: 404,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
          },
        },
      );
      appendVaryAccept(fallback404.headers);
      return fallback404;
    }

    // HTML representation path
    const htmlRes = env.ASSETS
      ? await env.ASSETS.fetch(request)
      : new Response('Not Found', { status: 404 });

    // If 404 from assets, serve 404.html with status 404
    if (htmlRes.status === 404 && env.ASSETS) {
      const notFoundHtmlRes = await env.ASSETS.fetch(
        new Request(new URL('/404.html', url).toString(), request),
      );
      if (notFoundHtmlRes.status === 200) {
        const body = await notFoundHtmlRes.text();
        const custom404 = new Response(body, {
          status: 404,
          headers: notFoundHtmlRes.headers,
        });
        custom404.headers.set('Content-Type', 'text/html; charset=utf-8');
        appendVaryAccept(custom404.headers);
        custom404.headers.set(
          'Link',
          '</404.md>; rel="alternate"; type="text/markdown"',
        );
        return custom404;
      }
    }

    const body = await htmlRes.arrayBuffer();
    const res = new Response(body, {
      status: htmlRes.status,
      statusText: htmlRes.statusText,
      headers: new Headers(htmlRes.headers),
    });
    appendVaryAccept(res.headers);

    if (res.headers.get('content-type')?.includes('text/html')) {
      const mdPath = markdownPath(url.pathname);
      const linkValue = `<${mdPath}>; rel="alternate"; type="text/markdown"`;
      const existing = res.headers.get('Link') || res.headers.get('link');
      if (!existing) {
        res.headers.set('Link', linkValue);
      } else if (!existing.includes(linkValue)) {
        res.headers.set('Link', `${existing}, ${linkValue}`);
      }
    }

    return res;
  },
};
