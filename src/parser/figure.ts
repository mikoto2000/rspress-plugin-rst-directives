import type { FigureDirective } from '../types.js';
import { parseImageOptions } from './image-options.js';

export function parseFigure(source: string): FigureDirective {
  const [openingLine, ...contentLines] = source.replaceAll('\r\n', '\n').split('\n');
  const openingMatch = /^\s*\.\. figure::(?:[ \t]+(.*?))?[ \t]*$/.exec(
    openingLine ?? '',
  );

  if (!openingMatch) {
    throw new Error('Expected a figure directive.');
  }

  const src = openingMatch[1]?.trim() ?? '';
  if (!src) {
    throw new Error('Invalid figure: figure source must not be empty.');
  }

  const content = dedentContent(contentLines);
  const { options, bodyLines } = parseImageOptions(content);
  const caption = bodyLines.join('\n').trim();

  return {
    type: 'figure',
    src,
    options,
    ...(caption ? { caption: { raw: caption } } : {}),
  };
}

function dedentContent(lines: string[]): string[] {
  const nonBlankLines = lines.filter(line => line.trim() !== '');
  const indentation = Math.min(
    ...nonBlankLines.map(line => line.length - line.trimStart().length),
  );

  if (!Number.isFinite(indentation)) {
    return [];
  }

  return lines.map(line => line.slice(indentation));
}
