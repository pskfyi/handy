import { regexp } from "../../parser/regexp.ts";
import { string } from "../../parser/string.ts";
import { line, newline, whitespace } from "../../parser/named.ts";
import type { Text } from "../../string/Text.ts";
import { indent } from "../../string/indent.ts";
import type { Parser } from "../../parser/Parser.ts";

/** @module
 *
 * Utils for working with non-fenced markdown code blocks. */

export type IndentedCodeBlockDetails = {
  type: "indented";
  code: string;
};

export function create(code: string): string {
  return indent(code, 4);
}

const indented = string("    ").ignore;
const indentedNonBlankLine = indented.and(line.nonBlank);

const upToFourSpaces = regexp(/^ {0,4}/).match.ignore;
const blankLines = indented.and(whitespace.inline)
  .or(upToFourSpaces.and(newline))
  .zeroOrMore.join();

const firstLine = indentedNonBlankLine;
const subsequentLines: Parser<string> = blankLines
  .and(indentedNonBlankLine).join()
  .zeroOrMore.join();

export const parser: Parser<IndentedCodeBlockDetails> = firstLine
  .and(subsequentLines).join()
  .into((code) => ({ type: "indented" as const, code }))
  .named("md.codeBlock.indented");

export function parse(codeBlock: string): IndentedCodeBlockDetails {
  return parser.parse(codeBlock)[0];
}

export type IndentedCodeBlockSearchResult = [
  details: IndentedCodeBlockDetails,
  location: Text.Location,
];

export function findAll(markdown: string): IndentedCodeBlockSearchResult[] {
  const [results] = parser.node.or(line.ignore).zeroOrMore
    .parse(markdown);

  return results.map(({ value: details, start }) => [details, start]);
}
