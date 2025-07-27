import type * as JsonTree from "../tree/types.ts";
import { assertPointer } from "./guards.ts";
import { escape, unescape } from "./escape.ts";
import type { Pointer } from "./types.ts";

/** Zero, or an unsigned integer with no leading zeroes. */
export const ARRAY_INDEX_PATTERN = /^(0|[1-9][0-9]*)$/;

/** Parses a single JSON Pointer token without validation. Use with caution.
 *
 * Casts valid array indices to numbers, and unescapes forward slashes and
 * tildes.
 *
 * @example
 * decodeToken("fo~100") // "fo/oo"
 *
 * @example
 * decodeToken("7") // 7 (a number, not a string) */
export function decodeToken(token: string): string | number {
  return token.match(ARRAY_INDEX_PATTERN) ? Number(token) : unescape(token);
}

/** Stringifies and escapes the input to create a valid JSON Pointer token.
 *
 * @example
 * encodeToken("fo/00") // "fo~1oo"
 *
 * @example
 * encodeToken(7) // "7" (a string) */
export function encodeToken(token: string | number): string {
  return escape(String(token));
}

/** Parses the input without validation. Use with caution.
 *
 * @example
 * parsePointer('/fo~1oo/7/ba~0rr') // ["fo/oo", 7, "ba~rr"] */
export function parsePointer(input: Pointer): JsonTree.Path {
  return input.split("/").slice(1).map(decodeToken);
}

/** Validates that the input is a valid JSON Pointer, then parses it.
 *
 * @example
 * decode('/fo~1oo/7/ba~0rr') // ["fo/oo", 7, "ba~rr"] */
export function decode(input: string): JsonTree.Path {
  assertPointer(input);

  return parsePointer(input);
}

/** Encodes an array of strings and numbers as a JSON Pointer.
 *
 * @example
 * encode(["fo/oo", 7, "ba~rr"]) // '/fo~1oo/7/ba~0rr' */
export function encode(input: JsonTree.Path): Pointer {
  return input.length ? `/${input.map(encodeToken).join("/")}` : "";
}
