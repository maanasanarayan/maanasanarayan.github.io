import { toString } from 'mdast-util-to-string';
import readingTime from 'reading-time';

/**
 * Remark plugin: inject `minutesRead` and `wordCount` into
 * `frontmatter` so Astro pages can read them via
 * `remarkPluginFrontmatter` returned from `render()`.
 */
export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const stats = readingTime(textOnPage);
    data.astro.frontmatter.minutesRead = stats.text; // e.g. "3 min read"
    data.astro.frontmatter.wordCount = stats.words;
  };
}
