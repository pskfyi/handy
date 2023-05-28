import { Text } from "../../string/Text.ts";
import { indent } from "../../string/indent.ts";
import { INDENTED_CODE_BLOCK_REGEX } from "./regex.ts";
import { SearchResult } from "./types.ts";

export type IndentedCodeBlockDetails = {
  type: "indented";
  code: string;
  indentation: string;
};

export function create(code: string): string {
  return indent(code, 4);
}

export function parse(codeBlock: string): IndentedCodeBlockDetails {
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

  return { type, code, indentation };
}

export function findAll(markdown: string): SearchResult[] {
  const text = new Text(markdown);

  return [...markdown.matchAll(INDENTED_CODE_BLOCK_REGEX)]
    .map((match) => [match[0], text.locationAt(match.index ?? 0)]);
}
