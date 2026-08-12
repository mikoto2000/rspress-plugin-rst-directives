import { describe, expect, it } from 'vitest';

import { transformListTable } from '../../src/transform/list-table.js';

describe('transformListTable', () => {
  it('creates a semantic table AST', () => {
    const node = transformListTable({
      type: 'list-table',
      options: { headerRows: 0 },
      rows: [
        { cells: [{ raw: 'A' }, { raw: 'B' }] },
        { cells: [{ raw: 'C' }, { raw: 'D' }] },
      ],
    });

    expect(node).toMatchObject({
      name: 'table',
      children: [
        {
          name: 'tbody',
          children: [
            { children: [{ name: 'td' }, { name: 'td' }] },
            { children: [{ name: 'td' }, { name: 'td' }] },
          ],
        },
      ],
    });
  });
});
