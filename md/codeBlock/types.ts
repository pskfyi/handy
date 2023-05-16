import { FencedCodeBlockDetails } from "./fenced.ts";
import { IndentedCodeBlockDetails } from "./indented.ts";

export type CodeBlockInfo = {
  code: string;
  lineNumber: number;
};

export type CodeBlockDetails =
  | IndentedCodeBlockDetails
  | FencedCodeBlockDetails;
