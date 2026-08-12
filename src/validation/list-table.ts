import type { ListTableDirective } from '../types.js';

export function validateListTable(table: ListTableDirective): void {
  const expectedCells = table.rows[0]?.cells.length;
  if (expectedCells === undefined) {
    return;
  }

  table.rows.forEach((row, index) => {
    if (row.cells.length !== expectedCells) {
      throw new Error(
        `Invalid list-table: row ${index + 1} has ${row.cells.length} cell, but row 1 has ${expectedCells} cells.`,
      );
    }
  });
}
