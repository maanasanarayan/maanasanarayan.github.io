import { fileURLToPath } from 'node:url';

/**
 * Astro integration that registers a custom dev-toolbar app showing
 * draft + future-dated blog posts. Only active in dev (`astro dev`).
 */
export default function draftToolbar() {
  return {
    name: 'draft-toolbar',
    hooks: {
      'astro:config:setup': ({ addDevToolbarApp }) => {
        addDevToolbarApp({
          id: 'maanasa-drafts',
          name: 'Drafts',
          icon: '📝',
          entrypoint: fileURLToPath(
            new URL('../dev-toolbar/drafts-app.mjs', import.meta.url),
          ),
        });
      },
    },
  };
}
