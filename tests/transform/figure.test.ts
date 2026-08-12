import { describe, expect, it } from 'vitest';

import { transformFigure } from '../../src/transform/figure.js';

describe('transformFigure', () => {
  it('creates a semantic figure with an accessible image', () => {
    const node = transformFigure({
      type: 'figure',
      src: 'https://example.com/image.png',
      options: {},
    });

    expect(node).toMatchObject({
      type: 'mdxJsxFlowElement',
      name: 'figure',
      attributes: [{ name: 'className', value: 'rst-figure' }],
      children: [
        {
          name: 'img',
          attributes: [
            { name: 'src', value: 'https://example.com/image.png' },
            { name: 'alt', value: '' },
          ],
        },
      ],
    });
  });

  it('parses a figure caption as Markdown blocks', () => {
    const node = transformFigure({
      type: 'figure',
      src: './image.png',
      options: {},
      caption: { raw: '**Important** `diagram`\n\nSecond paragraph.' },
    });

    expect(node).toMatchObject({
      children: [
        { name: 'img' },
        {
          name: 'figcaption',
          children: [
            {
              type: 'paragraph',
              children: [
                { type: 'strong', children: [{ value: 'Important' }] },
                { type: 'text', value: ' ' },
                { type: 'inlineCode', value: 'diagram' },
              ],
            },
            { type: 'paragraph', children: [{ value: 'Second paragraph.' }] },
          ],
        },
      ],
    });
  });
});
