import type { Root } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';

import { remarkRstDirectives } from '../src/remark.js';
import type { RstDirectivesOptions } from '../src/types.js';

describe('remarkRstDirectives', () => {
  it('replaces a list-table source range with a table AST', async () => {
    const source = `# Tables

.. list-table:: Test table
   :header-rows: 1

   * - Name
     - Description
   * - foo
     - **Foo** description

After the table.`;

    const tree = await transform(source);
    const table = tree.children[1] as MdxJsxFlowElement;

    expect(table).toMatchObject({
      type: 'mdxJsxFlowElement',
      name: 'table',
      children: [
        { name: 'caption' },
        { name: 'thead' },
        { name: 'tbody' },
      ],
    });
    expect(tree.children[2]).toMatchObject({ type: 'paragraph' });
  });

  it('replaces a figure source range and preserves following Markdown', async () => {
    const source = `.. figure:: https://example.com/image.png
   :alt: External image

   **Important** diagram.

After the figure.`;

    const tree = await transform(source);

    expect(tree.children[0]).toMatchObject({
      type: 'mdxJsxFlowElement',
      name: 'figure',
      children: [
        {
          name: 'img',
          attributes: [
            { name: 'src', value: 'https://example.com/image.png' },
            { name: 'alt', value: 'External image' },
          ],
        },
        { name: 'figcaption' },
      ],
    });
    expect(tree.children[1]).toMatchObject({ type: 'paragraph' });
  });

  it('adds an ESM asset import for a relative figure image', async () => {
    const tree = await transform('.. figure:: ./images/sample.png');

    expect(tree.children).toMatchObject([
      {
        type: 'mdxjsEsm',
        value:
          'import __rstFigureImage0 from "./images/sample.png";',
      },
      { type: 'mdxJsxFlowElement', name: 'figure' },
    ]);
  });

  it('can disable figure independently from list-table', async () => {
    const source = '.. figure:: ./image.png';

    expect(
      await transform(source, { directives: { figure: false } }),
    ).toEqual(parseWithoutPlugin(source));
    expect(
      (await transform(source, { directives: { listTable: false } })).children,
    ).toMatchObject([
      { type: 'mdxjsEsm' },
      { type: 'mdxJsxFlowElement', name: 'figure' },
    ]);
  });

  it.each([
    `.. note::

   hello`,
    `.. image:: ./image.png`,
    `![sample](./image.png)`,
    `| A | B |
|---|---|
| C | D |`,
    `\`\`\`rst
.. list-table:: Not a directive here

   * - A
\`\`\``,
  ])('leaves unrelated Markdown unchanged', async source => {
    expect(await transform(source)).toEqual(parseWithoutPlugin(source));
  });

  it('reports the source file and directive line for invalid tables', async () => {
    const source = `# Invalid

.. list-table::
   :header-rows: abc`;

    await expect(transform(source)).rejects.toThrow(
      /docs[/\\]index\.md:3:1.*header-rows must be a non-negative integer/,
    );
  });

  it('reports the source file and directive line for invalid figures', async () => {
    const source = `# Invalid

.. figure:: ./image.png
   :align: diagonal`;

    await expect(transform(source)).rejects.toThrow(
      /docs[/\\]index\.md:3:1.*figure option "align".*diagonal/,
    );
  });
});

async function transform(
  source: string,
  options?: RstDirectivesOptions,
): Promise<Root> {
  const processor = unified().use(remarkParse);
  if (options) {
    processor.use(remarkRstDirectives, options);
  } else {
    processor.use(remarkRstDirectives);
  }
  const parsed = processor.parse(source);
  return processor.run(parsed, {
    path: 'docs/index.md',
    value: source,
  }) as Promise<Root>;
}

function parseWithoutPlugin(source: string): Root {
  return unified().use(remarkParse).parse(source);
}
