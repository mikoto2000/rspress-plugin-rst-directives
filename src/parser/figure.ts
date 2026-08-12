import type { FigureDirective } from '../types.js';

export function parseFigure(source: string): FigureDirective {
  const [openingLine] = source.replaceAll('\r\n', '\n').split('\n');
  const openingMatch = /^\s*\.\. figure::(?:[ \t]+(.*?))?[ \t]*$/.exec(
    openingLine ?? '',
  );

  if (!openingMatch) {
    throw new Error('Expected a figure directive.');
  }

  const src = openingMatch[1]?.trim() ?? '';
  if (!src) {
    throw new Error('Invalid figure: figure source must not be empty.');
  }

  return {
    type: 'figure',
    src,
    options: {},
  };
}
