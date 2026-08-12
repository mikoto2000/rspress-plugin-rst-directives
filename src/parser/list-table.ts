import type { ListTableDirective } from '../types.js';

export function parseListTable(source: string): ListTableDirective {
  const [openingLine, ...contentLines] = source.replaceAll('\r\n', '\n').split('\n');
  if (openingLine?.trim() !== '.. list-table::') {
    throw new Error('Expected a list-table directive.');
  }

  const bodyLines = dedentContent(contentLines);
  const rows = bodyLines.flatMap(line => {
    const match = /^\* -(?: (.*))?$/.exec(line);
    return match ? [{ cells: [{ raw: match[1] ?? '' }] }] : [];
  });

  return {
    type: 'list-table',
    options: { headerRows: 0 },
    rows,
  };
}

function dedentContent(lines: string[]): string[] {
  const nonBlankLines = lines.filter(line => line.trim() !== '');
  const indentation = Math.min(
    ...nonBlankLines.map(line => line.length - line.trimStart().length),
  );

  if (!Number.isFinite(indentation)) {
    return [];
  }

  return lines.map(line => line.slice(indentation));
}
