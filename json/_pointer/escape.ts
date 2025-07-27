/** A tilde that isn't followed by a 0 or a 1. */
export const UNESCAPED_TILDE_PATTERN = /~(?![01])/;

/** Escapes tildes, then forward slashes.
 *
 * @example
 * escape("fo/oo") // "fo~1oo"
 *
 * @example
 * escape("ba~rr") // "ba~0rr" */
export function escape(input: string): string {
  return input.replaceAll("~", "~0").replaceAll("/", "~1");
}

/** Unescapes forward slashes, then tildes.
 *
 * @example
 * unescape("fo~1oo") // "fo/oo"
 *
 * @example
 * unescape("ba~0rr") // "ba~rr"
 *
 * @example
 * unescape("~01") // "~1" */
export function unescape(input: string): string | number {
  return input.replaceAll("~1", "/").replaceAll("~0", "~");
}

/** @returns true if the input includes no unescaped characters */
export function isEscaped(input: string): boolean {
  return !input.includes("/") && input.match(UNESCAPED_TILDE_PATTERN) === null;
}

/** @returns true if the input includes unescaped characters */
export function isUnescaped(input: string): boolean {
  return !isEscaped(input);
}
