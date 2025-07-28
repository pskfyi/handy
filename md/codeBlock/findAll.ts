import { line } from "../../parser/named.ts";
import {
  type FencedCodeBlockSearchResult,
  parser as fenced,
} from "./fenced.ts";
import {
  type IndentedCodeBlockSearchResult,
  parser as indented,
} from "./indented.ts";

/**
 * @module
 *
 * Find code blocks in a markdown document. */

export type SearchResult =
  | FencedCodeBlockSearchResult
  | IndentedCodeBlockSearchResult;

export function findAll(markdown: string): SearchResult[] {
  const [results] = fenced.node.or(indented.node).or(line.ignore).zeroOrMore
    .parse(markdown);

  return results
    .map(({ value: details, start }) => [details, start] as SearchResult);
}
