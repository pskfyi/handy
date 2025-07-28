/**
 * @module
 *
 * Escape sequences for strings. */

/** Replaces special characters with their escape sequences.
 *
 * Note: `escape` is a global function in JavaScript, so we use `escapeFull`. */
export function escapeFull(str: string): string {
  return str
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")
    .replaceAll("\t", "\\t")
    .replaceAll("\f", "\\f")
    .replaceAll("\v", "\\v")
    .replaceAll("\b", "\\b");
}

/** Replaces special characters with single Unicode symbols that represent
 * them, ensuring that the output length is the same as the input length.
 *
 * - `\n` becomes `¶`
 * - `\r` becomes `␍`
 * - `\t` becomes `⇥`
 * - `\f` becomes `␌`
 * - `\v` becomes `␋`
 * - `\b` becomes `␈` */
export function escapeTerse(str: string): string {
  return str
    .replaceAll("\n", "¶")
    .replaceAll("\r", "␍")
    .replaceAll("\t", "⇥")
    .replaceAll("\f", "␌")
    .replaceAll("\v", "␋")
    .replaceAll("\b", "␈");
}
