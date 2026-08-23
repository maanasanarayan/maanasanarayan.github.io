import { defineMiddleware } from 'astro:middleware';

const PRODUCES = ['text/html', 'text/markdown'];

type AcceptEntry = {
  type: string;
  q: number;
  specificity: number;
};

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
  if (entry.type === '*/*') return true;
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

export const onRequest = defineMiddleware(async (ctx, next) => {
  const acceptHeader = ctx.request.headers.get('accept');
  const chosen = preferredType(acceptHeader, PRODUCES);

  if (chosen === null && acceptHeader) {
    return new Response(
      'Not Acceptable\n\nAvailable representations: text/html, text/markdown\n',
      {
        status: 406,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          Vary: 'Accept, Accept-Encoding',
        },
      },
    );
  }

  const response = await next();
  appendVaryAccept(response.headers);
  return response;
});
