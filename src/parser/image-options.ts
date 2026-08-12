import type { ImageOptions } from '../types.js';

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
