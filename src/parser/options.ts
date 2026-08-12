import type { ListTableOptions } from '../types.js';

export interface ParsedListTableOptions {
  options: ListTableOptions;
  bodyLines: string[];
}

export function parseListTableOptions(
  lines: string[],
): ParsedListTableOptions {
  const options: ListTableOptions = { headerRows: 0 };
  let index = 0;

  while (lines[index]?.trim() === '') {
    index += 1;
  }

  while (index < lines.length) {
    const match = /^:([a-z-]+):\s*(.*)$/.exec(lines[index] ?? '');
    if (!match) {
      break;
    }

    if (match[1] === 'header-rows') {
      options.headerRows = parseHeaderRows(match[2] ?? '');
    }
    index += 1;
  }

  while (lines[index]?.trim() === '') {
    index += 1;
  }

  return { options, bodyLines: lines.slice(index) };
}

function parseHeaderRows(raw: string): number {
  if (!/^\d+$/.test(raw)) {
    throw new Error(
      `Invalid list-table: header-rows must be a non-negative integer, received "${raw}".`,
    );
  }

  return Number(raw);
}
