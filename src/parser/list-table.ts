import type { ListTableDirective, ListTableRow } from '../types.js';
import { validateListTable } from '../validation/list-table.js';

export function parseListTable(source: string): ListTableDirective {
  const [openingLine, ...contentLines] = source.replaceAll('\r\n', '\n').split('\n');
  if (openingLine?.trim() !== '.. list-table::') {
    throw new Error('Expected a list-table directive.');
  }

  const bodyLines = dedentContent(contentLines);
  const rows = parseRows(bodyLines);

  const table: ListTableDirective = {
    type: 'list-table',
    options: { headerRows: 0 },
    rows,
  };

  validateListTable(table);
  return table;
}

function parseRows(lines: string[]): ListTableRow[] {
  const rows: ListTableRow[] = [];

  for (const line of lines) {
    const rowMatch = /^\* -(?: (.*))?$/.exec(line);
    if (rowMatch) {
      rows.push({ cells: [{ raw: rowMatch[1] ?? '' }] });
      continue;
    }

    const cellMatch = /^  -(?: (.*))?$/.exec(line);
    const currentRow = rows.at(-1);
    if (cellMatch && currentRow) {
      currentRow.cells.push({ raw: cellMatch[1] ?? '' });
    }
  }

  return rows;
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
