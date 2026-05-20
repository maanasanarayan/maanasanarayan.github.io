import { component, defineMarkdocConfig } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    /**
     * Tinted call-out box, matching the rest of the neo-brutalist palette.
     *
     * Usage in `.mdoc`:
     *
     *   {% callout type="note" title="Heads up" %}
     *   …body…
     *   {% /callout %}
     */
    callout: {
      render: component('./src/components/markdoc/Callout.astro'),
      attributes: {
        type: {
          type: String,
          default: 'note',
          matches: ['note', 'warn', 'tip', 'inspiration'],
        },
        title: { type: String },
      },
    },

    /** Inline highlight pill — `{% hl %}some words{% /hl %}` */
    hl: {
      render: component('./src/components/markdoc/Highlight.astro'),
    },

    /** Linked YouTube embed placeholder (no third-party script). */
    youtube: {
      render: component('./src/components/markdoc/YouTube.astro'),
      attributes: {
        id: { type: String, required: true },
        title: { type: String, required: true },
      },
    },
  },
});
