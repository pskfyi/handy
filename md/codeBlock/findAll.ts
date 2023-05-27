import { CODE_BLOCK_REGEX } from "./regex.ts";
import { location, TextLocation } from "../../string/location.ts";

export type SearchResult = [
  code: string,
  location: TextLocation,
];
/** Find all code blocks in a markdown string. */
export function findAll(markdown: string): SearchResult[] {
  const matches = [...markdown.matchAll(CODE_BLOCK_REGEX)];

  return matches.map((match) => {
    return [match[0], location(markdown, match.index ?? 0)];
  });
}
