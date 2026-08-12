import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import { findDirectiveBlocks } from './parser/directive.js';
import { parseListTable } from './parser/list-table.js';
import { transformListTable } from './transform/list-table.js';
import type { RstDirectivesOptions } from './types.js';

export const remarkRstDirectives: Plugin<[RstDirectivesOptions?], Root> =
  function remarkRstDirectives(options = {}) {
    return (tree, file) => {
      if (options.directives?.listTable === false) {
        return;
      }

      const source = String(file);
      const blocks = findDirectiveBlocks(source, tree)
        .filter(block => block.name === 'list-table')
        .sort((left, right) => right.startOffset - left.startOffset);

      for (const block of blocks) {
        const firstIndex = tree.children.findIndex(child =>
          overlaps(child.position?.start.offset, child.position?.end.offset, block),
        );
        if (firstIndex === -1) {
          continue;
        }

        let lastIndex = firstIndex;
        while (
          lastIndex + 1 < tree.children.length &&
          overlaps(
            tree.children[lastIndex + 1]?.position?.start.offset,
            tree.children[lastIndex + 1]?.position?.end.offset,
            block,
          )
        ) {
          lastIndex += 1;
        }

        try {
          const table = transformListTable(parseListTable(block.source));
          tree.children.splice(firstIndex, lastIndex - firstIndex + 1, table);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const location = `${file.path || '<unknown>'}:${block.startLine}:${block.startColumn}`;
          file.fail(`${location}: ${message}`, {
            line: block.startLine,
            column: block.startColumn,
          });
        }
      }
    };
  };

function overlaps(
  startOffset: number | undefined,
  endOffset: number | undefined,
  block: { startOffset: number; endOffset: number },
): boolean {
  return (
    startOffset !== undefined &&
    endOffset !== undefined &&
    startOffset < block.endOffset &&
    endOffset > block.startOffset
  );
}
