import { describe, expect, it } from 'vitest';

import { transformListTable } from '../../src/transform/list-table.js';

describe('transformListTable', () => {
  it('creates a semantic table AST', () => {
    const node = transformListTable({
      type: 'list-table',
      options: { headerRows: 0 },
      rows: [
        { cells: [{ raw: 'A' }, { raw: 'B' }] },
        { cells: [{ raw: 'C' }, { raw: 'D' }] },
      ],
    });

    expect(node).toMatchObject({
      name: 'table',
      children: [
        {
          name: 'tbody',
          children: [
            { children: [{ name: 'td' }, { name: 'td' }] },
            { children: [{ name: 'td' }, { name: 'td' }] },
          ],
        },
      ],
    });
  });

  it('creates caption, colgroup, and header sections', () => {
    const node = transformListTable({
      type: 'list-table',
      title: 'Test table',
      options: { headerRows: 1, widths: [20, 80] },
      rows: [
        { cells: [{ raw: 'Name' }, { raw: 'Description' }] },
        { cells: [{ raw: 'foo' }, { raw: 'Foo description' }] },
      ],
    });

    expect(node).toMatchObject({
      children: [
        { name: 'caption' },
        {
          name: 'colgroup',
          children: [
            { name: 'col', attributes: [{ name: 'width', value: '20%' }] },
            { name: 'col', attributes: [{ name: 'width', value: '80%' }] },
          ],
        },
        {
          name: 'thead',
          children: [{ children: [{ name: 'th' }, { name: 'th' }] }],
        },
        {
          name: 'tbody',
          children: [{ children: [{ name: 'td' }, { name: 'td' }] }],
        },
      ],
    });
  });

  it('renders multiple header rows as th cells', () => {
    const node = transformListTable({
      type: 'list-table',
      options: { headerRows: 2 },
      rows: [
        { cells: [{ raw: 'Group' }, { raw: 'Value' }] },
        { cells: [{ raw: 'Name' }, { raw: 'Description' }] },
        { cells: [{ raw: 'foo' }, { raw: 'Foo description' }] },
      ],
    });

    expect(node).toMatchObject({
      children: [
        {
          name: 'thead',
          children: [
            { children: [{ name: 'th' }, { name: 'th' }] },
            { children: [{ name: 'th' }, { name: 'th' }] },
          ],
        },
        {
          name: 'tbody',
          children: [{ children: [{ name: 'td' }, { name: 'td' }] }],
        },
      ],
    });
  });

  it('parses cell content as Markdown AST', () => {
    const node = transformListTable({
      type: 'list-table',
      options: { headerRows: 0 },
      rows: [{ cells: [{ raw: '**Bold** `code`' }] }],
    });

    expect(node).toMatchObject({
      children: [
        {
          name: 'tbody',
          children: [
            {
              children: [
                {
                  name: 'td',
                  children: [
                    { type: 'strong', children: [{ value: 'Bold' }] },
                    { type: 'text', value: ' ' },
                    { type: 'inlineCode', value: 'code' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('keeps block wrappers for multiline cell content', () => {
    const node = transformListTable({
      type: 'list-table',
      options: { headerRows: 0 },
      rows: [{ cells: [{ raw: 'First paragraph.\n\nSecond paragraph.' }] }],
    });

    expect(node).toMatchObject({
      children: [
        {
          name: 'tbody',
          children: [
            {
              children: [
                {
                  name: 'td',
                  children: [
                    { type: 'paragraph' },
                    { type: 'paragraph' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
