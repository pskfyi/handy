import { indent } from "../../string/indent.ts";
import { Intersect } from "../../ts/types.ts";
import { INDENTED_CODE_BLOCK_REGEX } from "./regex.ts";
import { CodeBlockInfo } from "./types.ts";

export type IndentedCodeBlockDetails = Intersect<
  & CodeBlockInfo //code: & lineNumber:
  & {
    type: "indented";
    indentation: string;
  }
>;

export function create(code: string): string {
  return indent(code, 4);
}

export function parse(
  codeBlock: string,
  startLineNumber = 1,
): IndentedCodeBlockDetails {
  const lines = codeBlock.split("\n");
  const regex = /^ {4,}/;
  const indent = Math.min(...lines
    .map((line) => line.match(regex)?.[0].length || Infinity));

  if (indent === Infinity) throw new TypeError("Invalid indented code block");

  const code = lines
    .map((line) => line.slice(indent).trimEnd())
    .join("\n")
    .replace(/(^\n+|\n+$)/g, "");

  const type = "indented" as const;
  const indentation = " ".repeat(indent);

  return { type, code, indentation, lineNumber: startLineNumber };
}

/** Find all code blocks in a markdown string. */
export function findAll(markdown: string): CodeBlockInfo[] {
  const matches = [...markdown.matchAll(INDENTED_CODE_BLOCK_REGEX)];

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
