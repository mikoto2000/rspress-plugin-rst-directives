import type { Root } from 'mdast';

export interface DirectiveBlock {
  name: string;
  source: string;
  startOffset: number;
  endOffset: number;
  startLine: number;
  startColumn: number;
}

interface SourceLine {
  value: string;
  startOffset: number;
}

export function findDirectiveBlocks(
  source: string,
  tree: Root,
): DirectiveBlock[] {
  const paragraphStarts = new Set(
    tree.children
      .filter(child => child.type === 'paragraph')
      .map(child => child.position?.start.offset)
      .filter((offset): offset is number => offset !== undefined),
  );
  const lines = splitLines(source);
  const blocks: DirectiveBlock[] = [];

  lines.forEach((line, index) => {
    const match = /^(\s*)\.\. ([a-z][a-z0-9-]*)::/.exec(line.value);
    if (!match) {
      return;
    }

    const indentation = match[1]?.length ?? 0;
    if (!paragraphStarts.has(line.startOffset + indentation)) {
      return;
    }

    let endOffset = source.length;
    for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
      const nextLine = lines[nextIndex];
      if (!nextLine || nextLine.value.trim() === '') {
        continue;
      }

      const nextIndentation = nextLine.value.length - nextLine.value.trimStart().length;
      if (nextIndentation <= indentation) {
        endOffset = nextLine.startOffset;
        break;
      }
    }

    blocks.push({
      name: match[2] ?? '',
      source: source.slice(line.startOffset, endOffset).trimEnd(),
      startOffset: line.startOffset,
      endOffset,
      startLine: index + 1,
      startColumn: indentation + 1,
    });
  });

  return blocks;
}

function splitLines(source: string): SourceLine[] {
  const lines: SourceLine[] = [];
  let startOffset = 0;

  for (const rawLine of source.split('\n')) {
    lines.push({
      value: rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine,
      startOffset,
    });
    startOffset += rawLine.length + 1;
  }

  return lines;
}
