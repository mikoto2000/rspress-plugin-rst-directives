import { describe, expect, it } from 'vitest';

import { parseFigure } from '../../src/parser/figure.js';

describe('parseFigure', () => {
  it('parses a minimal figure directive', () => {
    expect(parseFigure('.. figure:: ./image.png')).toEqual({
      type: 'figure',
      src: './image.png',
      options: {},
    });
  });

  it('rejects a figure without a source', () => {
    expect(() => parseFigure('.. figure::')).toThrow(
      'figure source must not be empty',
    );
  });

  it('preserves a multiline caption as Markdown source', () => {
    const source = `.. figure:: ./image.png

   First paragraph.

   Second paragraph.`;

    expect(parseFigure(source).caption).toEqual({
      raw: 'First paragraph.\n\nSecond paragraph.',
    });
  });
});
