import { blue, gray } from "../_deps/fmt.ts";
import { consoleWidth } from "../cli/consoleSize.ts";
import { Text } from "./Text.ts";
import { elideAround } from "./elide.ts";
import { escapeTerse } from "./escape.ts";

export declare namespace TextCursor {
  export interface InspectOptions {
    /** The maximum length of the line to display. */
    maxLength?: number;
    /** Whether to colorize the output. */
    colors?: boolean;
    /** Whether to display the line number. */
    lineNumber?: boolean;
  }
}

/** Describes a string and an index within it. */
export class TextCursor extends Text {
  readonly index: number;
  #cache = {} as Record<number, Text.Location>;

  constructor(input: string | Text | TextCursor, index?: number) {
    super(input);
    this.index = index ?? (input instanceof TextCursor ? input.index : 0);
  }

  /** The character at the current index, if extant. */
  get char(): string | undefined {
    return this.value.at(this.index);
  }

  /** The substring from the start of the string to the current index. */
  get antecedent(): string {
    return this.index === 0 ? "" : this.value.slice(0, this.index);
  }

  /** The substring from the current index to the end of the input. */
  get remainder(): string {
    return this.index === 0 ? this.value : this.value.slice(this.index);
  }

  get location(): Text.Location {
    if (!this.#cache[this.index]) {
      this.#cache[this.index] = this.locationAt(this.index);
    }

    return this.#cache[this.index];
  }

  get line(): string {
    return this.lines[this.location.line - 1];
  }

  get column(): number {
    return this.location.column;
  }

  /** @returns a new TextCursor with the same input moved by `amount`. */
  move(amount: number): TextCursor {
    return new TextCursor(this, this.index + amount);
  }

  /** Shorthand for `this.input.startsWith(str, this.index)`. */
  startsWith(str: string): boolean {
    return this.value.startsWith(str, this.index);
  }

  /** Depicts the location around the current index in the input string like so:
   *
   * ```
   * …jumps over the lazy d…
               ^
   * ```
   *
   * Uses `escapeTerse()` from the `string` module to convert special characters
   * to single-character representations. Importantly:
   *
   * - `\t` becomes `⇥`
   * - `\n` becomes `¶`
   * - `\r` becomes `␍` */
  inspect(opts?: TextCursor.InspectOptions): string {
    let {
      maxLength = consoleWidth(40),
      colors = true,
      lineNumber: showLineNumber,
    } = opts ?? {};

    showLineNumber ??= this.lines.length > 1;

    const { column, line } = this.location;
    const lineMarker = showLineNumber ? `[L${line}] ` : "";

    maxLength = maxLength - lineMarker.length;
    const [elided, offset] = elideAround(this.line, column - 1, { maxLength });
    const pointerSpacing = " ".repeat(offset + lineMarker.length);

    const escaped = escapeTerse(elided);
    const str = escaped.replaceAll(" ", colors ? gray("·") : "·");

    return colors
      ? `${blue(lineMarker)}${str}\n${pointerSpacing}${blue("^")}`
      : `${lineMarker}${str}\n${pointerSpacing}^`;
  }

  toString(): string {
    const [str] = elideAround(this.value, this.index, { maxLength: 20 });

    return `TextCursor("${str}", ${this.index})`;
  }

  /** The function called by `console.log()` in Deno. */
  [Symbol.for("Deno.customInspect")](
    _: unknown,
    opts: Deno.InspectOptions,
  ): string {
    return this.inspect(opts);
  }
}
