import type { FigureAlign, ImageOptions } from '../types.js';

export interface ParsedImageOptions {
  options: ImageOptions;
  bodyLines: string[];
}

export function parseImageOptions(lines: string[]): ParsedImageOptions {
  const options: ImageOptions = {};
  let index = 0;

  while (lines[index]?.trim() === '') {
    index += 1;
  }

  while (index < lines.length) {
    const match = /^:([a-z-]+):\s*(.*)$/.exec(lines[index] ?? '');
    if (!match) {
      break;
    }

    const name = match[1] ?? '';
    const value = match[2] ?? '';
    if (name === 'alt') {
      options.alt = value;
    } else if (name === 'width') {
      options.width = parseCssSize(name, value);
    } else if (name === 'height') {
      options.height = parseCssSize(name, value);
    } else if (name === 'align') {
      options.align = parseAlign(value);
    } else if (name === 'class') {
      options.classNames = parseClassNames(value);
    } else {
      throw new Error(`Invalid figure: unsupported option "${name}".`);
    }
    index += 1;
  }

  while (lines[index]?.trim() === '') {
    index += 1;
  }

  return { options, bodyLines: lines.slice(index) };
}

const cssSizePattern = /^(?:0|(?:\d+(?:\.\d+)?|\.\d+)(?:%|px|rem|em|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc))$/;

function parseCssSize(name: 'width' | 'height', value: string): string {
  if (!cssSizePattern.test(value)) {
    throw new Error(
      `Invalid figure: figure option "${name}" has invalid value "${value}".`,
    );
  }

  return value;
}

function parseAlign(value: string): FigureAlign {
  if (value !== 'left' && value !== 'center' && value !== 'right') {
    throw new Error(
      `Invalid figure: figure option "align" must be left, center, or right, received "${value}".`,
    );
  }

  return value;
}

function parseClassNames(value: string): string[] {
  const classNames = value.trim().split(/\s+/).filter(Boolean);
  const invalidClassName = classNames.find(
    className => !/^[^\s"'`<>=\u0000-\u001f\u007f]+$/.test(className),
  );

  if (classNames.length === 0 || invalidClassName) {
    throw new Error(
      `Invalid figure: figure option "class" contains invalid class name "${invalidClassName ?? value}".`,
    );
  }

  return classNames;
}
