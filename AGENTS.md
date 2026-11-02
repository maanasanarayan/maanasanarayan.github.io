# Repository Guidelines

- Use Bun for dependency and script execution (`bun install`, `bun run ...`).
- This site targets Astro 7 and Vite 8. Keep `@astrojs/*` integrations on Astro-7-compatible majors and keep the Vite override on `^8.0.13` or newer.
- The project intentionally uses `@astrojs/markdown-remark` with `processor: unified()` because blog content depends on remark/rehype plugins for reading time, Mermaid, math, and KaTeX.
- Before committing, run the repo hooks/checks: `bun run format:check`, `bun run lint`, `bun run check`, and `bun run build`. Husky also runs staged linting on commit and Astro check/build on push.
- Claude SEO is applied through the upstream Claude Code plugin `AgriciDaniel/claude-seo`. For future SEO work, prefer its `/seo` workflows when running in Claude Code and keep generated audit reports out of the production site unless they are explicitly intended content.

## Adding art

The `/art/` gallery is built from two content collections (see `src/content.config.ts`).

- **One piece = one Markdown file** in `src/content/art/`, e.g. `src/content/art/sunrise-mandala.md`. The file name becomes the URL (`/art/sunrise-mandala/`). Nested folders work too (`src/content/art/2026/foo.md` becomes `/art/2026/foo/`). Do not put a `README.md` or any other non-artwork `.md` file in that folder; the loader treats every `.md`/`.mdx` file there as a piece.
- **Images** go in `src/assets/art/` (or next to the entry) and are referenced by a path relative to the Markdown file. Use the original photo (JPEG/PNG, 1500px or more on the long side); Astro generates the AVIF/WebP sizes at build time. Never put art images in `public/`, or they will not be optimised.
- **The body** of the file is the optional inspiration note shown under "Where it came from". Leave it empty if there is nothing to say; the section is hidden.

```markdown
---
title: Sunrise Mandala
excerpt: One or two plain sentences for cards, search results and the meta description.
type: mandala # id from src/content/art-types.yaml
date: 2026-03-14
image: ../../assets/art/sunrise-mandala.jpg
imageAlt: Orange and gold mandala drawn in fine pen, with twelve petal rings around a dotted centre
# optional
gallery:
  - src: ../../assets/art/sunrise-mandala-detail.jpg
    alt: Close-up of the centre rings and dot work
medium: Micron pens and gel pens on 300gsm paper
dimensions: 30 × 30 cm
tags: [fineliner, gel-pen, floral]
featured: false # true pins it to the spread at the top of /art/
draft: false # true hides it from production builds (still visible in `bun run dev`)
source: https://www.instagram.com/p/XXXXXXXXXXX/
---

What prompted it, what you tried, what you would do differently. A few short paragraphs is plenty.
```

- `imageAlt` should describe what the piece looks like (colours, motif, composition), not repeat the title.
- `excerpt` is one plain sentence (80-160 characters) on what the viewer sees: subject, the most distinctive visual detail, and the medium when known.
- **Tags** are lowercase, hyphenated, British spelling, 3-6 per piece, and never repeat the art type. Reuse the existing vocabulary so tags stay consistent:
  - Medium: `fineliner`, `gel-pen`, `brush-pen`, `watercolour`, `acrylic`, `coloured-pencil`, `pencil`, `marker`, `mixed-media`
  - Form: `half-mandala`, `quarter-mandala`, `dot-art`, `zentangle`, `line-art`, `silhouette`, `monochrome`, `colour-blocking`
  - Subject: `floral`, `lotus`, `sunflower`, `tulip`, `hibiscus`, `moon`, `night-sky`, `sunset`, `landscape`, `seascape`, `waterfall`, `rain`, `storm`, `forest`, `animal`, `bird`, `arrow`, `deity` (plus the deity's name, e.g. `shiva`), `kathakali`, `dreamcatcher`, `still-life`, `pop-culture`
  - Surface (only when not plain paper): `black-paper`, `coloured-paper`, `bookmark`, `stone`, `wood`, `furniture`
  - Series: `monsoon-mania-2020`, `spooktober-2020`; process: `work-in-progress` (only when the gallery has in-progress shots)
- **Adding a new art form** (say, "Pottery"): add an entry to `src/content/art-types.yaml` with `id`, `name`, `description`, `color` (one of `accent`, `secondary`, `muted`, `mint`, `sky`) and `order`, then use that `id` as `type` in pieces. The filter chip, `/art/type/<id>/` page, Markdown alternate and sitemap entry follow automatically; empty forms are hidden from the chips and the sitemap.
- After adding pieces, run `bun run build` and check `/art/`, the piece page and its type page.
