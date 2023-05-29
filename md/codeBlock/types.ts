import type { FencedCodeBlockDetails } from "./fenced.ts";
import type { IndentedCodeBlockDetails } from "./indented.ts";

export type CodeBlockDetails =
  | IndentedCodeBlockDetails
  | FencedCodeBlockDetails;
