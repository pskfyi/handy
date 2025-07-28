import { TextCursor } from "../string/TextCursor.ts";
import { CoreParser, type Parse, type Value } from "./core.ts";

/** @module
 *
 * Special parser whose output is ignored. */

const IGNORE_OUTPUT = Symbol.for("handy.parser.ignoreOutput");

export type Ignored = typeof IGNORE_OUTPUT;

export type NonIgnored<T> = Exclude<T, Ignored>;

/** A parser that returns a special symbol to indicate that it succeeded but
 * should be ignored. */
export class IgnoredParser extends CoreParser<Ignored> {
  static readonly SYMBOL: Ignored = IGNORE_OUTPUT;

  constructor(parse: Parse<CoreParser>, toString?: () => string) {
    toString ??= () => "ignored";

    super((input) => {
      const [, cursor] = parse.call(this, new TextCursor(input));
      return [IGNORE_OUTPUT, cursor];
    }, toString);
  }

  /** Derive a parser that succeeds if `this` then `next` succeed in order,
   * but only returns the value of `next`.
   *
   * @example
   * const parser = string("hello").then(string(" world"));
   * parser.parse("hello world"); // ["hello", " world"] */
  and<P extends CoreParser>(next: P): P {
    return next.derive(
      (input) => {
        const [_, cursor] = this.parse(input);
        const [nextValue, nextCursor] = next.parse(cursor);

        return [nextValue as Value<P>, nextCursor];
      },
      () => `${this}.and(${next})`,
    );
  }
}
