import { parse as parseFenced } from "./fenced.ts";
import { parse as parseIndented } from "./indented.ts";
import type { CodeBlockDetails } from "./types.ts";

export function parse(codeBlock: string): CodeBlockDetails {
  return codeBlock[0] === " "
    ? parseIndented(codeBlock)
    : parseFenced(codeBlock);
}
