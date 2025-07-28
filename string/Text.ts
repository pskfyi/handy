import { toPosition } from "../collection/position.ts";

/**
 * @module
 *
 * A utility for working with blocks of text such as paragraphs or files. */

/** A location within a body of text. */
export type TextLocation = {
  /** A zero-based positive integer describing an index in a body of text. */
  offset: number;
  /** A one-based positive integer describing a line in a body of text. */
  line: number;
  /** A one-based positive integer describing a column in a line of text. */
  column: number;
};

export declare namespace Text {
  export { TextLocation as Location };
}

/** A wrapper around a string which is formatted as a body of text, such as the
 * contents of a text, markdown, or source code file. */
export class Text {
  readonly #input: { readonly value: string };
  #cache: { lines?: string[] } = {};

  /**
   * @example
   * const text = new Text("a\n\nb")
   * text.lines // ["a\n", "\n", "b"]
   * text.locationAtIndex(3) // { offset: 3, line: 3, column: 1 } */
  constructor(value: string | Text) {
    this.#input = value instanceof Text ? value.#input : { value };
  }

  /** A cached array of the lines in the input string, retaining newline
   * characters. */
  get lines(): string[] {
    if (!this.#cache.lines) {
      this.#cache.lines = this.value.split(/(?<=\r\n)|(?<=\r)(?!\n)|(?<=\n)/);
    }

    return this.#cache.lines;
  }

  /** An immutable reference to the input string. Alias of `this.input`. */
  get value(): string {
    return this.#input.value;
  }

  /** An immutable reference to the input string. Alias of `this.value`. */
  get input(): string {
    return this.#input.value;
  }

  /** The number of characters in the input string. Provided for parity with
   * native `String`. */
  get length(): number {
    return this.value.length;
  }

  /** Returns the input string. Provided for parity with native `String`. */
  valueOf(): string {
    return this.#input.value;
  }

  positionAt(index: number): number {
    return toPosition(index, this.value);
  }

  /** Get the `Text.Location` at `index`, which must correspond to a valid
   * `Position` within `this.value`.
   *
   * `index` may be negative, indicating an offset from the end of `text`, with
   * `-0` being the end itself, equal to `this.length`.
   *
   * @throws {TypeError} If `index` is positive and beyond the `text`'s end, or negative and beyond the `text`'s start, or is not an integer.
   *
   * @example
   * const text = new Text("a\n\nb")
   *
   * text.locationAtIndex(3) // Right before the "b"
   * // { offset: 3, line: 3, column: 1 }
   *
   * text.locationAtIndex(4) // Right after the "b"
   * // { offset: 4, line: 3, column: 2 }
   *
   * @example
   * const text = new Text("a\n\nb")
   *
   * text.locationAtIndex(-0) // End of text (right after the "b")
   * // { offset: 4, line: 3, column: 2 }
   *
   * text.locationAtIndex(-1) // Penultimate position (right before the "b")
   * // { offset: 3, line: 3, column: 1 } */
  locationAt(index: number): Text.Location { // "a\n\nb"
    const offset = this.positionAt(index);

    let currentIndex = 0;
    let line = 0;
    let column = 1;

    const lastLineIndex = String(this.lines.length - 1);

    for (const i in this.lines) {
      line += 1;
      const lineLength = this.lines[i].length;
      const isTargetLine = offset < currentIndex + lineLength;

      if (isTargetLine) {
        column = offset - currentIndex + 1;
        break;
      } else if (i === lastLineIndex) {
        column = lineLength + 1;
      }

      currentIndex += lineLength;
    }

    return { offset, line, column };
  }
}
