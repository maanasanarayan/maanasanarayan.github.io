---
title: 'Notes on neo-brutalism (and why I picked it)'
description: 'Thick borders, hard shadows, and a refusal to be invisible — the rationale behind this redesign.'
pubDate: 2026-03-04
tags: ['design', 'ui', 'frontend']
heroEmoji: '⚡'
---

Most portfolios I see look the same. Frosted-glass panels, gradient blobs,
a slightly tilted product screenshot. The aesthetic equivalent of a hotel
lobby — pleasant, expensive, and forgettable.

I picked **neo-brutalism** for this rebuild on purpose.

## What it is

The DNA, distilled:

- **Visible structure.** 4px black borders on everything. No "implied" cards.
- **Hard shadows.** `8px 8px 0 0 #000` — solid rectangles, never blurs.
- **Loud palette.** Cream paper, hot red, vivid yellow, soft violet.
- **Mechanical feedback.** Buttons _press down_ — `translate(2px, 2px)` and
  the shadow vanishes, like a physical switch.

## Why it works for a personal site

Three reasons:

1. **It is impossible to confuse with a template.** That alone is worth a lot.
2. **It scales down well.** A 2-line bio in a yellow box with a 6px shadow
   reads as confident, not sparse. Same content in the average SaaS aesthetic
   reads as unfinished.
3. **It's honest about being a website.** The "physicality" — stickers,
   collage, hand-stamped letters — leans _into_ the screen-ness of the medium
   instead of pretending we're rendering glass and chrome.

## When not to use it

- **Productivity tools.** All that contrast costs cognitive load. Don't make a
  spreadsheet app look like a punk poster.
- **High-density data UIs.** Borders and shadows compete with the data.
- **Anywhere users spend hours.** Neo-brutalism is a sprint aesthetic, not a
  marathon one.

The portfolio I just shipped is exactly the right venue: short visits, strong
signal, memorable on the way out.
