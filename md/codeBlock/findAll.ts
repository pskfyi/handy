import { CODE_BLOCK_REGEX } from "./regex.ts";
import type { CodeBlockInfo } from "./types.ts";

/** Find all code blocks in a markdown string. */
export function findAll(markdown: string): CodeBlockInfo[] {
  const matches = [...markdown.matchAll(CODE_BLOCK_REGEX)];

  return matches.map((match) => {
    const code = match[0];
    const lineNumber = getLineNumber(markdown, match.index ?? 0);
    return { code, lineNumber };
  });
}

function getLineNumber(text: string, index: number): number {
  const lines = text.slice(0, index).split("\n");
  return lines.length;
}
