import type { Root } from 'mdast';
import type { MdxjsEsm } from 'mdast-util-mdxjs-esm';
import type { Plugin } from 'unified';

import { findDirectiveBlocks } from './parser/directive.js';
import { parseFigure } from './parser/figure.js';
import { parseListTable } from './parser/list-table.js';
import {
  createFigureImageImport,
  transformFigure,
} from './transform/figure.js';
import { transformListTable } from './transform/list-table.js';
import type { RstDirectivesOptions } from './types.js';

export const remarkRstDirectives: Plugin<[RstDirectivesOptions?], Root> =
  function remarkRstDirectives(options = {}) {
    return (tree, file) => {
      const source = String(file);
      const blocks = findDirectiveBlocks(source, tree)
        .filter(block => isEnabled(block.name, options))
        .sort((left, right) => right.startOffset - left.startOffset);
      const imageImports: MdxjsEsm[] = [];
      let imageIndex = 0;

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
          if (block.name === 'list-table') {
            const table = transformListTable(parseListTable(block.source));
            tree.children.splice(firstIndex, lastIndex - firstIndex + 1, table);
          } else if (block.name === 'figure') {
            const figure = parseFigure(block.source);
            const imageIdentifier = isLocalImageSource(figure.src)
              ? `__rstFigureImage${imageIndex++}`
              : undefined;
            if (imageIdentifier) {
              imageImports.push(
                createFigureImageImport(imageIdentifier, figure.src),
              );
            }
            tree.children.splice(
              firstIndex,
              lastIndex - firstIndex + 1,
              transformFigure(figure, imageIdentifier),
            );
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const location = `${file.path || '<unknown>'}:${block.startLine}:${block.startColumn}`;
          file.fail(`${location}: ${message}`, {
            line: block.startLine,
            column: block.startColumn,
          });
        }
      }

      tree.children.unshift(...imageImports);
    };
  };

function isEnabled(name: string, options: RstDirectivesOptions): boolean {
  if (name === 'list-table') {
    return options.directives?.listTable !== false;
  }
  if (name === 'figure') {
    return options.directives?.figure !== false;
  }
  return false;
}

function isLocalImageSource(source: string): boolean {
  return !/^(?:[a-z][a-z\d+.-]*:|\/\/|\/)/i.test(source);
}

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
