import { CODE_BLOCK_REGEX } from "./regex.ts";
import type { SearchResult } from "./types.ts";
import { Text } from "../../string/Text.ts";

export function findAll(markdown: string): SearchResult[] {
  const text = new Text(markdown);

  return [...markdown.matchAll(CODE_BLOCK_REGEX)]
    .map((match) => [match[0], text.locationAt(match.index ?? 0)]);
}
