import type { FencedCodeBlockDetails } from "./fenced.ts";
import type { IndentedCodeBlockDetails } from "./indented.ts";

/**
 * @module
 *
 * Shared markdown code block types. */

export type CodeBlockDetails =
  | IndentedCodeBlockDetails
  | FencedCodeBlockDetails;
