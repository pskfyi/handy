import { parse as parseFenced } from "./fenced.ts";
import { parse as parseIndented } from "./indented.ts";

export function parse(codeBlock: string) {
  return codeBlock[0] === " "
    ? parseIndented(codeBlock)
    : parseFenced(codeBlock);
}
