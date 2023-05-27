import { toPosition } from "../collection/position.ts";

export type TextLocation = { offset: number; line: number; column: number };

/** Get a position within `text` at `index`.
 *
 * @throws {TypeError} if `index` is positive and beyond the text's end, or negative and beyond the text's start, or not an integer.
 *
 * @example
 * location("a\n\nb", 3) // Right before the "b"
 * // {offset: 3, line: 3, column: 1}
 * location("a\n\nb", 4) // Right after the "b"
 * // {offset: 4, line: 3, column: 2}
 *
 * @example
 * location("a\n\nb", -0) // End of `text` (right after the "b")
 * // {offset: 4, line: 3, column: 2}
 * location("a\n\nb", -1) // Penultimate position (right before the "b")
 * // {offset: 3, line: 3, column: 1} */
export function location(text: string, index: number): TextLocation {
  const offset = toPosition(index, text);
  const lines = text.slice(0, offset).split(/\r?\n|\r/);

  return {
    offset,
    line: lines.length,
    column: lines.at(-1)!.length + 1,
  };
}
