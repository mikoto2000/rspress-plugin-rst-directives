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
});
