# Repository Guidelines

- Use Bun for dependency and script execution (`bun install`, `bun run ...`).
- This site targets Astro 7 and Vite 8. Keep `@astrojs/*` integrations on Astro-7-compatible majors and keep the Vite override on `^8.0.13` or newer.
- The project intentionally uses `@astrojs/markdown-remark` with `processor: unified()` because blog content depends on remark/rehype plugins for reading time, Mermaid, math, and KaTeX.
- Before committing, run the repo hooks/checks: `bun run format:check`, `bun run lint`, `bun run check`, and `bun run build`. Husky also runs staged linting on commit and Astro check/build on push.
- Claude SEO is applied through the upstream Claude Code plugin `AgriciDaniel/claude-seo`. For future SEO work, prefer its `/seo` workflows when running in Claude Code and keep generated audit reports out of the production site unless they are explicitly intended content.
