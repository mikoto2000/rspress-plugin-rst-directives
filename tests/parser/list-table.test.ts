import { describe, expect, it } from 'vitest';

import { parseListTable } from '../../src/parser/list-table.js';

describe('parseListTable', () => {
  it('recognizes an empty list-table directive', () => {
    const source = '.. list-table::';

    expect(parseListTable(source)).toEqual({
      type: 'list-table',
      options: { headerRows: 0 },
      rows: [],
    });
  });

  it('parses one row with one cell', () => {
    const source = `.. list-table::

   * - A`;

    expect(parseListTable(source).rows).toEqual([
      { cells: [{ raw: 'A' }] },
    ]);
  });

  it('parses multiple rows and cells', () => {
    const source = `.. list-table::

   * - A
     - B
   * - C
     - D`;

    expect(parseListTable(source).rows).toEqual([
      { cells: [{ raw: 'A' }, { raw: 'B' }] },
      { cells: [{ raw: 'C' }, { raw: 'D' }] },
    ]);
  });
});
