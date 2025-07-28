import { TextCursor } from "../string/TextCursor.ts";
import { Parser } from "./Parser.ts";

/**
 * @module
 *
 * A parser for strings. */

/** @example
 * const parser = string("hello");
 * parser.parse("hello"); // ["hello", TextCursor]
 * parser.parse("world"); // throws ParseError */
export function string<T extends string>(...values: T[]): Parser<T> {
  return new Parser(
    function (input): [T, TextCursor] {
      const cursor = new TextCursor(input);

      for (const val of values) {
        if (cursor.startsWith(val)) return [val, cursor.move(val.length)];
      }

      this.throw(cursor);
    },
    () => `string(${values.map((val) => JSON.stringify(val)).join(", ")})`,
  );
}
