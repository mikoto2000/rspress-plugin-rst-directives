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

export type FigureAlign = 'left' | 'center' | 'right';

export interface ImageOptions {
  alt?: string;
  width?: string;
  height?: string;
  align?: FigureAlign;
  classNames?: string[];
}

export interface FigureCaption {
  raw: string;
}

export interface FigureDirective {
  type: 'figure';
  src: string;
  options: ImageOptions;
  caption?: FigureCaption;
}

export interface RstDirectivesOptions {
  directives?: {
    listTable?: boolean;
    figure?: boolean;
  };
}
