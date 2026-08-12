import type { Root } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';

import { remarkRstDirectives } from '../src/remark.js';

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

  it.each([
    `.. note::

   hello`,
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
});

async function transform(source: string): Promise<Root> {
  const processor = unified().use(remarkParse).use(remarkRstDirectives);
  const parsed = processor.parse(source);
  return processor.run(parsed, {
    path: 'docs/index.md',
    value: source,
  }) as Promise<Root>;
}

function parseWithoutPlugin(source: string): Root {
  return unified().use(remarkParse).parse(source);
}
