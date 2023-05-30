import { line } from "../../parser/named.ts";
import { FencedCodeBlockSearchResult, parser as fenced } from "./fenced.ts";
import {
  IndentedCodeBlockSearchResult,
  parser as indented,
} from "./indented.ts";

export type SearchResult =
  | FencedCodeBlockSearchResult
  | IndentedCodeBlockSearchResult;

export function findAll(markdown: string): SearchResult[] {
  const [results] = fenced.node.or(indented.node).or(line.ignore).zeroOrMore
    .parse(markdown);

  return results
    .map(({ value: details, start }) => [details, start] as SearchResult);
}
