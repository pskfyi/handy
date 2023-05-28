import type { TextLocation } from "../../string/Text.ts";
import type { FencedCodeBlockDetails } from "./fenced.ts";
import type { IndentedCodeBlockDetails } from "./indented.ts";

export type CodeBlockDetails =
  | IndentedCodeBlockDetails
  | FencedCodeBlockDetails;

export type SearchResult = [
  code: string,
  location: TextLocation,
];
