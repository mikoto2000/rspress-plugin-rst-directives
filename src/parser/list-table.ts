import type { ListTableDirective } from '../types.js';

export function parseListTable(source: string): ListTableDirective {
  if (source.trim() !== '.. list-table::') {
    throw new Error('Expected a list-table directive.');
  }

  return {
    type: 'list-table',
    options: { headerRows: 0 },
    rows: [],
  };
}
