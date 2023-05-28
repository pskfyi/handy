import { CODE_BLOCK_REGEX } from "./regex.ts";
import { location } from "../../string/location.ts";
import type { SearchResult } from "./types.ts";

export function findAll(markdown: string): SearchResult[] {
  return [...markdown.matchAll(CODE_BLOCK_REGEX)]
    .map((match) => [match[0], location(markdown, match.index ?? 0)]);
}
