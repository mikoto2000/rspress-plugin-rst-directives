import { fromMarkdown } from 'mdast-util-from-markdown';
import type {
  MdxJsxAttribute,
  MdxJsxFlowElement,
} from 'mdast-util-mdx-jsx';

import type { FigureDirective } from '../types.js';

export function transformFigure(figure: FigureDirective): MdxJsxFlowElement {
  const children: MdxJsxFlowElement['children'] = [
    element('img', [], [
      attribute('src', figure.src),
      attribute('alt', figure.options.alt ?? ''),
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

  return element('figure', children, [attribute('className', 'rst-figure')]);
}

function attribute(name: string, value: string): MdxJsxAttribute {
  return { type: 'mdxJsxAttribute', name, value };
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
