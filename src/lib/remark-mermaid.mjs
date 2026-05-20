import { visit } from 'unist-util-visit';

/**
 * Convert ```mermaid code blocks into raw <pre class="mermaid"> nodes so
 * Shiki leaves them alone. Mermaid is then rendered client-side.
 *
 * No external dependency: we only walk the markdown AST.
 */
export function remarkMermaid() {
  return function (tree) {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid' || !parent || typeof index !== 'number') {
        return;
      }
      const value = node.value || '';
      parent.children[index] = {
        type: 'html',
        value: `<pre class="mermaid">${escape(value)}</pre>`,
      };
    });
  };
}

function escape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
