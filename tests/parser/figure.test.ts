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

  it('parses the alt option separately from the caption', () => {
    const source = `.. figure:: ./image.png
   :alt: Sample image

   Caption.`;

    expect(parseFigure(source)).toMatchObject({
      options: { alt: 'Sample image' },
      caption: { raw: 'Caption.' },
    });
  });

  it.each(['640px', '80%', '32rem'])('accepts width %s', width => {
    const source = `.. figure:: ./image.png
   :width: ${width}`;

    expect(parseFigure(source).options.width).toBe(width);
  });

  it.each(['invalid!!!', 'javascript:alert(1)', '-1px'])(
    'rejects invalid width %s',
    width => {
      const source = `.. figure:: ./image.png
   :width: ${width}`;

      expect(() => parseFigure(source)).toThrow(
        `figure option "width" has invalid value "${width}"`,
      );
    },
  );
});
