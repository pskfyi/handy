import { FencedCodeBlockDetails } from "./fenced.ts";
import { IndentedCodeBlockDetails } from "./indented.ts";

export type CodeBlockDetails =
  | IndentedCodeBlockDetails
  | FencedCodeBlockDetails;
