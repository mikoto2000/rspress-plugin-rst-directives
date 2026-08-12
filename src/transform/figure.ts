import { fromMarkdown } from 'mdast-util-from-markdown';
import type { Program } from 'estree';
import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
  MdxJsxFlowElement,
} from 'mdast-util-mdx-jsx';

import type { FigureDirective } from '../types.js';

export function transformFigure(figure: FigureDirective): MdxJsxFlowElement {
  const style = createStyleAttribute(
    figure.options.width,
    figure.options.height,
  );
  const children: MdxJsxFlowElement['children'] = [
    element('img', [], [
      attribute('src', figure.src),
      attribute('alt', figure.options.alt ?? ''),
      ...(style ? [style] : []),
    ]),
  ];

  if (figure.caption) {
    children.push(
      element(
        'figcaption',
        fromMarkdown(figure.caption.raw)
          .children as MdxJsxFlowElement['children'],
      ),
    );
  }

  const classNames = [
    'rst-figure',
    ...(figure.options.align ? [`rst-figure--${figure.options.align}`] : []),
    ...(figure.options.classNames ?? []),
  ];

  return element('figure', children, [
    attribute('className', classNames.join(' ')),
  ]);
}

function attribute(name: string, value: string): MdxJsxAttribute {
  return { type: 'mdxJsxAttribute', name, value };
}

function createStyleAttribute(
  width: string | undefined,
  height: string | undefined,
): MdxJsxAttribute | undefined {
  const styles = [
    ...(width ? [['width', width] as const] : []),
    ...(height ? [['height', height] as const] : []),
  ];
  if (styles.length === 0) {
    return undefined;
  }

  const expression = `{ ${styles
    .map(([name, value]) => `${name}: ${JSON.stringify(value)}`)
    .join(', ')} }`;
  const program: Program = {
    type: 'Program',
    sourceType: 'module',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'ObjectExpression',
          properties: styles.map(([name, value]) => ({
            type: 'Property',
            method: false,
            shorthand: false,
            computed: false,
            kind: 'init',
            key: { type: 'Identifier', name },
            value: { type: 'Literal', value },
          })),
        },
      },
    ],
  };
  const value: MdxJsxAttributeValueExpression = {
    type: 'mdxJsxAttributeValueExpression',
    value: expression,
    data: { estree: program },
  };

  return { type: 'mdxJsxAttribute', name: 'style', value };
}

function element(
  name: string,
  children: MdxJsxFlowElement['children'] = [],
  attributes: MdxJsxAttribute[] = [],
): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes,
    children,
  };
}
