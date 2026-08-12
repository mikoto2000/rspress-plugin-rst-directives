import { describe, expect, it } from 'vitest';

import {
  createFigureImageImport,
  transformFigure,
} from '../../src/transform/figure.js';

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

  it('maps image options to safe JSX attributes and figure classes', () => {
    const node = transformFigure({
      type: 'figure',
      src: './image.png',
      options: {
        alt: 'Architecture',
        width: '80%',
        height: '320px',
        align: 'center',
        classNames: ['architecture-diagram', 'highlighted'],
      },
    });

    expect(node).toMatchObject({
      attributes: [
        {
          name: 'className',
          value:
            'rst-figure rst-figure--center architecture-diagram highlighted',
        },
      ],
      children: [
        {
          name: 'img',
          attributes: [
            { name: 'src', value: './image.png' },
            { name: 'alt', value: 'Architecture' },
            {
              name: 'style',
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: '{ width: "80%", height: "320px" }',
              },
            },
          ],
        },
      ],
    });
  });

  it('uses an ESM import expression for a local image', () => {
    const node = transformFigure(
      {
        type: 'figure',
        src: './images/sample.png',
        options: { alt: 'Sample' },
      },
      '__rstFigureImage0',
    );
    const imageImport = createFigureImageImport(
      '__rstFigureImage0',
      './images/sample.png',
    );

    expect(imageImport).toMatchObject({
      type: 'mdxjsEsm',
      value:
        'import __rstFigureImage0 from "./images/sample.png";',
    });
    expect(node).toMatchObject({
      children: [
        {
          name: 'img',
          attributes: [
            {
              name: 'src',
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: '__rstFigureImage0',
              },
            },
            { name: 'alt', value: 'Sample' },
          ],
        },
      ],
    });
  });
});
