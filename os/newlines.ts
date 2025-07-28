/**
 * @module
 *
 * Utils for homogenizing line endings. */

/** Replace all `\r\n` and `\n` with `\r`. Handles existing `\r` correctly. */
export function macNewlines(str: string): string {
  return str.replace(/\r?\n/g, "\r");
}

/** Replace all `\r\n` and `\r` with `\n`. Handles existing `\n` correctly. */
export function posixNewlines(str: string): string {
  return str.replace(/\r\n?/g, "\n");
}

/** Replace all `\r` and `\n` with `\r\n`. Handles existing `\r\n` correctly. */
export function windowsNewlines(str: string): string {
  return str.replace(/(\r)\n?|\r?(\n)/g, "\r\n");
}
