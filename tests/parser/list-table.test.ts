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

  it('rejects inconsistent column counts', () => {
    const source = `.. list-table::

   * - A
     - B
   * - C`;

    expect(() => parseListTable(source)).toThrow(
      'row 2 has 1 cell, but row 1 has 2 cells',
    );
  });

  it('parses a title', () => {
    const source = `.. list-table:: Test table

   * - A`;

    expect(parseListTable(source).title).toBe('Test table');
  });

  it('parses header-rows', () => {
    const source = `.. list-table::
   :header-rows: 1

   * - Name
     - Description
   * - foo
     - Foo description`;

    expect(parseListTable(source).options.headerRows).toBe(1);
  });

  it.each(['abc', '-1'])('rejects invalid header-rows value %s', value => {
    const source = `.. list-table::
   :header-rows: ${value}`;

    expect(() => parseListTable(source)).toThrow(
      `header-rows must be a non-negative integer, received "${value}"`,
    );
  });

  it('rejects header-rows greater than the row count', () => {
    const source = `.. list-table::
   :header-rows: 2

   * - A
     - B`;

    expect(() => parseListTable(source)).toThrow(
      'header-rows is 2, but the table has only 1 row',
    );
  });
});
