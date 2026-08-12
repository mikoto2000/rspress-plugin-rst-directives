import type { ListTableDirective } from '../types.js';

export function validateListTable(table: ListTableDirective): void {
  if (table.rows.length === 0) {
    throw new Error(
      'Invalid list-table: list-table must contain at least one row.',
    );
  }

  const emptyRowIndex = table.rows.findIndex(row => row.cells.length === 0);
  if (emptyRowIndex !== -1) {
    throw new Error(
      `Invalid list-table: list-table row ${emptyRowIndex + 1} must contain at least one cell.`,
    );
  }

  if (table.options.headerRows > table.rows.length) {
    throw new Error(
      `Invalid list-table: header-rows is ${table.options.headerRows}, but the table has only ${table.rows.length} ${table.rows.length === 1 ? 'row' : 'rows'}.`,
    );
  }

  const expectedCells = table.rows[0]?.cells.length;
  if (expectedCells === undefined) {
    return;
  }

  if (
    table.options.widths &&
    table.options.widths.length !== expectedCells
  ) {
    throw new Error(
      `Invalid list-table: widths defines ${table.options.widths.length} columns, but the table has ${expectedCells} columns.`,
    );
  }

  table.rows.forEach((row, index) => {
    if (row.cells.length !== expectedCells) {
      throw new Error(
        `Invalid list-table: row ${index + 1} has ${row.cells.length} cell, but row 1 has ${expectedCells} cells.`,
      );
    }
  });
}
