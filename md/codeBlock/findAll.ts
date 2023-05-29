import { FencedCodeBlockSearchResult, findAll as fenced } from "./fenced.ts";
import {
  findAll as indented,
  IndentedCodeBlockSearchResult,
} from "./indented.ts";

export type SearchResult =
  | FencedCodeBlockSearchResult
  | IndentedCodeBlockSearchResult;

export function findAll(markdown: string): SearchResult[] {
  return [
    ...indented(markdown),
    ...fenced(markdown),
  ];
}
