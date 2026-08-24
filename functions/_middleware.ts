interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

type PagesFunction<
  Env = unknown,
  Params extends string = string,
  Data extends Record<string, unknown> = Record<string, unknown>,
> = (context: EventContext<Env, Params, Data>) => Response | Promise<Response>;

type AcceptEntry = {
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
  if (
    entry.type === '*/*' ||
    entry.type === '*/*;q=1' ||
    entry.type.startsWith('*/*')
  )
    return true;
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

export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method.toUpperCase();

  // CORS preflight support
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
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
      endpoints: {
        ask_nlweb: 'https://maanasa.dev/ask',
        mcp: 'https://maanasa.dev/api/mcp',
        mcp_docs: 'https://maanasa.dev/api/mcp/docs',
        api_catalog: 'https://maanasa.dev/.well-known/api-catalog',
        agent_card: 'https://maanasa.dev/.well-known/agent-card.json',
        agent_skills: 'https://maanasa.dev/.well-known/agent-skills/index.json',
        auth_guide: 'https://maanasa.dev/auth.md',
        protected_resource:
          'https://maanasa.dev/.well-known/oauth-protected-resource',
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
        { company: 'Kayak', role: 'Software Engineer', period: '2023 - 2026' },
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
        { company: 'Adobe', role: 'Software Engineer', period: '2018 - 2021' },
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
        'Access-Control-Allow-Origin': '*',
      },
    });
    appendVaryAccept(res.headers);
    return res;
  }

  // 2. Microsoft NLWeb protocol (/ask endpoint)
  if (pathname === '/ask') {
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
          _meta: { response_type: 'answer', version: '1.0', protocol: 'NLWeb' },
          query,
          answer: answerText,
          confidence: 1.0,
          sources: [
            { title: 'About Maanasa', url: 'https://maanasa.dev/about' },
          ],
        })}\n\n`,
        `event: complete\ndata: ${JSON.stringify({ status: 'complete' })}\n\n`,
      ];

      return new Response(streamData.join(''), {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(
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
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }

  // 3. RFC 9727 API Catalog
  if (pathname === '/.well-known/api-catalog') {
    const catalogData = {
      linkset: [
        {
          anchor: 'https://maanasa.dev/',
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
    return new Response(JSON.stringify(catalogData, null, 2), {
      status: 200,
      headers: {
        'Content-Type':
          'application/linkset+json;profile="https://www.rfc-editor.org/info/rfc9727"',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // 4. Agent Auth endpoints & entrypoint 401 hints
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
      return new Response(
        JSON.stringify(
          {
            error: 'unauthorized',
            message: 'Authentication required. See RFC 9728 metadata.',
          },
          null,
          2,
        ),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'WWW-Authenticate':
              'Bearer resource_metadata="https://maanasa.dev/.well-known/oauth-protected-resource"',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }
  }

  // Agent Registration / Claim / Revoke Mock Endpoints
  if (pathname === '/api/agent/register') {
    return new Response(
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
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
  if (pathname === '/api/agent/claim') {
    return new Response(
      JSON.stringify({
        status: 'claimed',
        token: 'token_agent_claimed_mock_2026',
        token_type: 'Bearer',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
  if (pathname === '/api/agent/revoke') {
    return new Response(
      JSON.stringify({
        status: 'revoked',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }

  // Direct static asset bypass
  if (STATIC_EXT.test(url.pathname)) {
    return next();
  }

  const acceptHeader = request.headers.get('accept');
  let chosen = preferredType(acceptHeader, PRODUCES);

  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  if (BOT_UAS.some((bot) => userAgent.includes(bot))) {
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
          Vary: 'Accept, Accept-Encoding',
        },
      },
    );
    return res;
  }

  // Markdown content negotiation
  if (chosen === 'text/markdown') {
    const mdUrl = new URL(url);
    mdUrl.pathname = markdownPath(url.pathname);
    const mdRes = await next(
      new Request(mdUrl.toString(), {
        headers: { Accept: '*/*' },
      }),
    );

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
      const altMdRes = await next(
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

    // 404 Markdown recovery
    const notFoundMdRes = await next(
      new Request(new URL('/404.md', url).toString(), {
        headers: { Accept: '*/*' },
      }),
    );
    if (notFoundMdRes.status === 200) {
      const body = await notFoundMdRes.text();
      const res = new Response(body, {
        status: 404,
        headers: notFoundMdRes.headers,
      });
      res.headers.set('Content-Type', 'text/markdown; charset=utf-8');
      appendVaryAccept(res.headers);
      return res;
    }

    const fallback404 = new Response(
      '---\ntitle: "404 Not Found"\ndescription: "Resource not found on maanasa.dev"\n---\n\n# 404 Not Found\n\nThe requested path does not exist on https://maanasa.dev.\n\n## Where to look next\n\n- Homepage: https://maanasa.dev/\n- About: https://maanasa.dev/about\n- Contact: https://maanasa.dev/contact\n- Privacy Policy: https://maanasa.dev/privacy\n- Sitemap: https://maanasa.dev/sitemap-index.xml\n- LLMs Context: https://maanasa.dev/llms.txt\n- Resume (PDF): https://maanasa.dev/documents/MaanasaNarayan.pdf\n',
      {
        status: 404,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          Vary: 'Accept, Accept-Encoding',
        },
      },
    );
    return fallback404;
  }

  // HTML path
  const htmlRes = await next();

  // If 404, serve custom 404 page with 404 status and recovery links
  if (htmlRes.status === 404) {
    if (url.pathname.endsWith('.md')) {
      const notFoundMdRes = await next(
        new Request(new URL('/404.md', url).toString(), request),
      );
      if (notFoundMdRes.status === 200) {
        const body = await notFoundMdRes.text();
        const custom404 = new Response(body, {
          status: 404,
          headers: notFoundMdRes.headers,
        });
        custom404.headers.set('Content-Type', 'text/markdown; charset=utf-8');
        appendVaryAccept(custom404.headers);
        return custom404;
      }
    } else {
      const notFoundHtmlRes = await next(
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
};
