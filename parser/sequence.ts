import { TextCursor } from "../string/TextCursor.ts";
import { ArrayParser } from "./Parser.ts";
import type { CoreParser, Value } from "./core.ts";
import { type Ignored, IgnoredParser } from "./ignored.ts";
import { type AsParsers, asParsers, type ParserLike } from "./parserLike.ts";

/**
 * @module
 *
 * A parser for sequences of values. */

/** Extracts the non-ignored values of each input parser, preserving
 * tuple order. */
export type SequenceValue<P extends CoreParser[]> = //
  P extends [infer Head extends CoreParser, ...infer Tail extends CoreParser[]]
    ? Head extends CoreParser<Ignored> ? SequenceValue<Tail>
    : [Value<Head>, ...SequenceValue<Tail>]
    : [];

export type Sequence<P extends ParserLike[]> = //
  ArrayParser<SequenceValue<AsParsers<P>>>;

/** Make a Parser that matches the given parsers in order. Strings and RegExps
 * are converted to parsers using `string()` and `regexp().match` respectively.
 *
 * @example
 * const parser = sequence(string("hello"), string("world"));
 * parser.parse("helloworld"); // [["hello", "world"], TextCursor] */
export function sequence<P extends ParserLike[]>(
  ...parserLikes: P
): Sequence<P> {
  const parsers = asParsers(...parserLikes);

  return new ArrayParser((input) => {
    let value, cursor = new TextCursor(input);
    const values = [];

    for (const parser of parsers) {
      [value, cursor] = parser.parse(cursor);

      if (value !== IgnoredParser.SYMBOL) values.push(value);
    }

    return [values as SequenceValue<AsParsers<P>>, cursor];
  }, () => `array(${parsers.map((parser) => parser.toString()).join(", ")})`);
}
