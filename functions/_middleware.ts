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
  /\.(?:css|js|mjs|map|png|jpe?g|webp|gif|svg|avif|ico|woff2?|ttf|otf|eot|xml|txt|json|pdf|mp4|webm|mp3|wav|ogg|zip)$/i;

export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);

  // Direct static asset bypass
  if (STATIC_EXT.test(url.pathname) || url.pathname.startsWith('/api/')) {
    return next();
  }

  const acceptHeader = request.headers.get('accept');
  const chosen = preferredType(acceptHeader, PRODUCES);

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
    const mdRes = await next(new Request(mdUrl.toString(), request));

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
      const altMdRes = await next(new Request(altMdUrl.toString(), request));
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
      new Request(new URL('/404.md', url).toString(), request),
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
      '# 404 Not Found\n\nThe requested path does not exist on https://maanasa.dev.\n\n## Where to look next\n\n- Homepage: https://maanasa.dev/\n- About: https://maanasa.dev/about\n- Contact: https://maanasa.dev/contact\n- Privacy Policy: https://maanasa.dev/privacy\n- Sitemap: https://maanasa.dev/sitemap-index.xml\n- LLMs Context: https://maanasa.dev/llms.txt\n- Resume (PDF): https://maanasa.dev/documents/MaanasaNarayan.pdf\n',
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
    res.headers.set('Link', existing ? `${existing}, ${linkValue}` : linkValue);
  }

  return res;
};
