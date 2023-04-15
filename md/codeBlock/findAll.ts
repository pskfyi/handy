import { CODE_BLOCK_REGEX } from "./regex.ts";
/** Find all code blocks in a markdown string. */
export function findAll(markdown: string): string[] {
  const matches = markdown.matchAll(CODE_BLOCK_REGEX);

  return [...matches].map((match) => match[0]);
}
