import type { ListTableDirective, ListTableRow } from '../types.js';
import { validateListTable } from '../validation/list-table.js';
import { parseListTableOptions } from './options.js';

export function parseListTable(source: string): ListTableDirective {
  const [openingLine, ...contentLines] = source.replaceAll('\r\n', '\n').split('\n');
  const openingMatch = /^\s*\.\. list-table::(?:[ \t]+(.*?))?[ \t]*$/.exec(
    openingLine ?? '',
  );
  if (!openingMatch) {
    throw new Error('Expected a list-table directive.');
  }

  const content = dedentContent(contentLines);
  const { options, bodyLines } = parseListTableOptions(content);
  const rows = parseRows(bodyLines);

  const table: ListTableDirective = {
    type: 'list-table',
    ...(openingMatch[1] ? { title: openingMatch[1] } : {}),
    options,
    rows,
  };

  validateListTable(table);
  return table;
}

function parseRows(lines: string[]): ListTableRow[] {
  const rows: ListTableRow[] = [];
  let currentCell: { raw: string } | undefined;

  for (const line of lines) {
    if (/^\*\s*$/.test(line)) {
      currentCell = undefined;
      rows.push({ cells: [] });
      continue;
    }

    const rowMatch = /^\* -(?: (.*))?$/.exec(line);
    if (rowMatch) {
      currentCell = { raw: rowMatch[1] ?? '' };
      rows.push({ cells: [currentCell] });
      continue;
    }

    const cellMatch = /^  -(?: (.*))?$/.exec(line);
    const currentRow = rows.at(-1);
    if (cellMatch && currentRow) {
      currentCell = { raw: cellMatch[1] ?? '' };
      currentRow.cells.push(currentCell);
      continue;
    }

    if (line === '' && currentCell) {
      currentCell.raw += '\n';
      continue;
    }

    const continuationMatch = /^ {4}(.*)$/.exec(line);
    if (continuationMatch && currentCell) {
      currentCell.raw += `\n${continuationMatch[1] ?? ''}`;
    }
  }

  for (const row of rows) {
    for (const cell of row.cells) {
      cell.raw = cell.raw.replace(/\n+$/, '');
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
