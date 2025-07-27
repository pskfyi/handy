import { create as createFenced, type CreateFencedOptions } from "./fenced.ts";
import { create as createIndented } from "./indented.ts";

/** Create a markdown codeblock with optional language and metadata.
 *
 * @returns an indented code block (4 spaces) by default, or a fenced code block if `char`, `lang`, or `meta` are provided
 *
 * @example create("const a = 1;")
 * // "    const a = 1;" // unfenced
 *
 * @example create("const a = 1;", { char: "`" })
 * // "```\nconst a = 1;\n```" */
export function create(
  code: string,
  options: CreateFencedOptions = {},
): string {
  const fenced = options.char || options.lang || options.meta;

  return fenced ? createFenced(code, options) : createIndented(code);
}
