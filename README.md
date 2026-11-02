# Maanasa Narayan - Portfolio

This repository contains the source for [maanasa.dev](https://maanasa.dev). The site is an Astro static site. Cloudflare Workers serves it.

## Sections

- `/`: Portfolio home page (about, experience, projects, recommendations, contact).
- `/blog/`: Blog posts, tag pages, search and an RSS feed at `/rss.xml`.
- `/art/`: Art gallery. Each piece has a page. Each art form has a page at `/art/type/<form>/`.
- `/developers/` and `/docs/`: API and agent documentation.

Each page also has a Markdown version at `<page>/index.md`.

## Requirements

- Node.js 22.23.4 or later.
- [Bun](https://bun.sh/) for dependencies and scripts.

## Local development

1. Install the dependencies: `bun install`.
2. Start the development server: `bun run dev`.
3. Open the URL that the server shows.

## Add a blog post

1. Add a Markdown file to `src/content/blog/`. The file name is the URL slug.
2. Set `title`, `description`, `pubDate` and `tags` in the frontmatter.
3. Set `draft: true` to keep a post out of production builds.

## Add a piece of art

1. Put the image in `src/assets/art/`.
2. Add a Markdown file to `src/content/art/`. The file name is the URL slug.
3. Set the frontmatter fields. `AGENTS.md` gives the template and the tag list.
4. Write the inspiration note in the body of the file, or leave the body empty.

To add an art form, add an entry to `src/content/art-types.yaml`.

## Checks

Run these commands before you commit:

```sh
bun run format:check
bun run lint
bun run check
bun run build
bun test
```

Husky runs lint-staged on commit. Husky runs `astro check` and the build on push.

## Deployment

Run `bun run deploy` to build the site and deploy it to Cloudflare Workers.
