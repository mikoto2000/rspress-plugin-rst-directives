export interface ListTableCell {
  raw: string;
}

export interface ListTableRow {
  cells: ListTableCell[];
}

export interface ListTableOptions {
  headerRows: number;
  widths?: number[];
}

export interface ListTableDirective {
  type: 'list-table';
  title?: string;
  options: ListTableOptions;
  rows: ListTableRow[];
}
