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
});
