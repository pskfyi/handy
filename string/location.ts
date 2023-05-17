export type TextLocation = { offset: number; line: number; column: number };

/** Get a position within `text` at `index`.
 *
 * @example
 * location("a\n\nb", 3) // Right before the "b"
 * // {offset: 3, line: 3, column: 1}
 * location("a\n\nb", 4) // Right after the "b"
 * // {offset: 4, line: 3, column: 2}
 *
 * @example
 * location("a\n\nb", -1) // End of `text` (right after the "b")
 * // {offset: 4, line: 3, column: 2}
 * location("a\n\nb", -2) // Penultimate position (right before the "b")
 * // {offset: 3, line: 3, column: 1}
 */
export function location(text: string, index: number): TextLocation {
  if (index > text.length) throw new Error("index is beyond the end of text");
  if (-index > text.length + 1) {
    throw new Error("Negative index would wrap around more than once");
  }

  const sliceEnd = index < 0 ? text.length + index + 1 : index;
  const lines = text.slice(0, sliceEnd).split(/\r?\n|\r/);

  return {
    offset: sliceEnd,
    line: lines.length,
    column: lines.at(-1)!.length + 1,
  };
}
