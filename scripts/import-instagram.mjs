#!/usr/bin/env node
/**
 * One-shot Instagram → /lifestyle gallery importer.
 *
 *   IG_TOKEN=<user-access-token> node scripts/import-instagram.mjs
 *
 * What it does:
 *   1. Detects whether the token is a Facebook user token (with linked IG
 *      Business via a FB Page) or an Instagram user token (newer
 *      Instagram Login flow). Resolves the IG user id either way.
 *   2. Pages through /media, pulls full-res images, writes them to
 *      src/assets/lifestyle/<slug>.jpg.
 *   3. Generates src/content/gallery/<slug>.md from the IG caption:
 *        first non-empty line → title
 *        the rest             → inspiration / description
 *        IG timestamp         → year
 *
 * Idempotent: skip an entry if its markdown already exists.
 * Never reads the token from a tracked file.
 */

import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOKEN = process.env.IG_TOKEN;
if (!TOKEN) {
  console.error('Missing IG_TOKEN env. Run:');
  console.error('  IG_TOKEN=<token> node scripts/import-instagram.mjs');
  process.exit(2);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ASSETS_DIR = join(ROOT, 'src', 'assets', 'lifestyle');
const CONTENT_DIR = join(ROOT, 'src', 'content', 'gallery');
const API = 'https://graph.facebook.com/v21.0';

const FIELDS =
  'id,caption,media_url,thumbnail_url,timestamp,media_type,permalink,children{media_url,media_type}';

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'piece';

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

async function gqlGet(path, params = {}) {
  const url = new URL(`${API}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('access_token', TOKEN);
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) {
    const msg = body?.error?.message || res.statusText;
    throw new Error(`GET ${path} → ${res.status}: ${msg}`);
  }
  return body;
}

async function resolveIgUserId() {
  // Try the Instagram Login path first (token is itself an IG user token).
  try {
    const me = await gqlGet('/me', { fields: 'id,username' });
    if (me.username) {
      console.log(`✓ IG user: @${me.username} (${me.id})`);
      return me.id;
    }
  } catch {
    /* fall through */
  }

  // Otherwise treat it as a Facebook user token and walk Pages → IG Business.
  const accounts = await gqlGet('/me/accounts', {
    fields: 'id,name,instagram_business_account',
  });
  for (const page of accounts.data || []) {
    if (page.instagram_business_account?.id) {
      const id = page.instagram_business_account.id;
      const ig = await gqlGet(`/${id}`, { fields: 'username' });
      console.log(`✓ IG via FB page "${page.name}": @${ig.username} (${id})`);
      return id;
    }
  }
  throw new Error(
    'No Instagram account reachable from this token. Make sure the IG account is a Business/Creator account and linked to a Facebook Page you own.',
  );
}

async function* paginate(igId) {
  let url = `/${igId}/media`;
  let params = { fields: FIELDS, limit: '50' };
  let n = 0;
  while (url) {
    const page = await gqlGet(url, params);
    for (const item of page.data || []) yield item;
    n += page.data?.length ?? 0;
    if (page.paging?.next) {
      // Switch to the raw next URL (already includes cursor + token).
      url = page.paging.next.replace(API, '');
      params = {};
    } else {
      url = null;
    }
    console.log(`  ↳ fetched ${n} so far…`);
  }
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return buf.length;
}

function frontmatter(post, imagePath, imageAlt) {
  const cap = (post.caption || '').trim();
  const lines = cap
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const title = lines[0]?.replace(/^#+\s*/, '') || `Piece ${post.id}`;
  const rest = lines.slice(1).join('\n\n').trim();
  const year = new Date(post.timestamp).getUTCFullYear();
  const description = rest.split(/\n\n/)[0]?.slice(0, 180) || title;
  const inspiration =
    rest ||
    'Imported from Instagram. Edit me — add the story behind this piece.';

  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `inspiration: |\n  ${inspiration.replace(/\n/g, '\n  ')}`,
    `medium: 'Mixed media'`,
    `year: ${year}`,
    `category: 'paper'`,
    `image: ${JSON.stringify(imagePath)}`,
    `imageAlt: ${JSON.stringify(imageAlt)}`,
    `aspect: 'square'`,
    `order: 100`,
    `permalink: ${JSON.stringify(post.permalink)}`,
    '---',
    '',
    rest || '_Imported from Instagram. Fill in the notes on making here._',
    '',
  ].join('\n');
}

async function main() {
  await mkdir(ASSETS_DIR, { recursive: true });
  await mkdir(CONTENT_DIR, { recursive: true });

  const igId = await resolveIgUserId();

  let imported = 0;
  let skipped = 0;
  let order = 100;

  for await (const post of paginate(igId)) {
    if (post.media_type === 'VIDEO') continue;

    const baseSlug = slug(
      (post.caption || '').split('\n')[0] || `post-${post.id}`,
    );
    const mdPath = join(CONTENT_DIR, `${baseSlug}.md`);
    if (await exists(mdPath)) {
      skipped++;
      continue;
    }

    const sources =
      post.media_type === 'CAROUSEL_ALBUM'
        ? (post.children?.data || []).filter((c) => c.media_type !== 'VIDEO')
        : [{ media_url: post.media_url, media_type: post.media_type }];

    const primary = sources[0];
    if (!primary?.media_url) continue;

    const imgName = `${baseSlug}.jpg`;
    const imgPath = join(ASSETS_DIR, imgName);
    const bytes = await download(primary.media_url, imgPath);
    const imagePath = `/images/lifestyle/${imgName}`;
    const imageAlt =
      (post.caption || '').split('\n')[0]?.slice(0, 140) || 'Doodle by Maanasa';

    const md = frontmatter({ ...post, order: order++ }, imagePath, imageAlt);
    await writeFile(mdPath, md);

    // Also drop a copy in public/images/lifestyle so the markdown's `image`
    // path resolves without needing to switch to <Image> for everything.
    const publicPath = join(ROOT, 'public', 'images', 'lifestyle', imgName);
    await mkdir(dirname(publicPath), { recursive: true });
    await writeFile(publicPath, await readFile(imgPath));

    console.log(`  + ${baseSlug} (${(bytes / 1024).toFixed(0)} KB)`);
    imported++;
  }

  console.log(`\n✓ done. imported=${imported}, skipped=${skipped}`);
  console.log(
    '\nNext: review src/content/gallery/*.md, fill in medium/category/palette where you can, then `bun run build`.',
  );
}

main().catch((err) => {
  console.error(`\n✖ ${err.message}`);
  process.exit(1);
});
