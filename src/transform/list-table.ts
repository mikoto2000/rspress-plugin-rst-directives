import { fromMarkdown } from 'mdast-util-from-markdown';
import type {
  MdxJsxAttribute,
  MdxJsxFlowElement,
} from 'mdast-util-mdx-jsx';

import type { ListTableCell, ListTableDirective, ListTableRow } from '../types.js';

export function transformListTable(
  table: ListTableDirective,
): MdxJsxFlowElement {
  const children: MdxJsxFlowElement[] = [];

  if (table.title) {
    children.push(element('caption', markdownChildren(table.title)));
  }

  if (table.options.widths) {
    children.push(createColgroup(table.options.widths));
  }

  const headerRows = table.rows.slice(0, table.options.headerRows);
  const bodyRows = table.rows.slice(table.options.headerRows);

  if (headerRows.length > 0) {
    children.push(createSection('thead', headerRows, 'th'));
  }
  children.push(createSection('tbody', bodyRows, 'td'));

  return element('table', children);
}

function createSection(
  name: 'thead' | 'tbody',
  rows: ListTableRow[],
  cellName: 'th' | 'td',
): MdxJsxFlowElement {
  return element(
    name,
    rows.map(row =>
      element(
        'tr',
        row.cells.map(cell => createCell(cellName, cell)),
      ),
    ),
  );
}

function createCell(
  name: 'th' | 'td',
  cell: ListTableCell,
): MdxJsxFlowElement {
  return element(name, cellMarkdownChildren(cell.raw));
}

function createColgroup(widths: number[]): MdxJsxFlowElement {
  const total = widths.reduce((sum, width) => sum + width, 0);
  return element(
    'colgroup',
    widths.map(width =>
      element('col', [], [
        {
          type: 'mdxJsxAttribute',
          name: 'width',
          value: `${(width / total) * 100}%`,
        },
      ]),
    ),
  );
}

function markdownChildren(markdown: string): MdxJsxFlowElement['children'] {
  return fromMarkdown(markdown).children as MdxJsxFlowElement['children'];
}

function cellMarkdownChildren(
  markdown: string,
): MdxJsxFlowElement['children'] {
  const children = fromMarkdown(markdown).children;
  const onlyChild = children[0];

  if (children.length === 1 && onlyChild?.type === 'paragraph') {
    return onlyChild.children as MdxJsxFlowElement['children'];
  }

  return children as MdxJsxFlowElement['children'];
}

function element(
  name: string,
  children: MdxJsxFlowElement['children'] = [],
  attributes: MdxJsxAttribute[] = [],
): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes,
    children,
  };
}
