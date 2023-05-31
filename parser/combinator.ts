import type { Tuple } from "../array/types.ts";
import type { Obj } from "../object/types.ts";
import { TextCursor } from "../string/TextCursor.ts";
import type { Pretty } from "../ts/types.ts";

const IGNORE_OUTPUT = Symbol.for("handy.parser.ignoreOutput");

/** A set of parsers which describe a language. Intended for use in `satisfies`
 * clauses.
 *
 * @example
 * export const number = {
 *   integer: regexp(/^-?\d+/).into(Number)
 * } satisfies Language; */
export type Language = Record<string, Parser>;

export declare namespace Parser {
  export type Value<P extends Parser | Parser[]> = P extends Parser<infer T> ? T
    : P extends Parser<infer T>[] ? T
    : never;

  export type Result<Value = unknown> = [value: Value, cursor: TextCursor];

  export type Fn<P extends Parser> = (
    this: Parser,
    input: string | TextCursor,
  ) => Result<Value<P>>;

  export type IgnoreOutput = typeof IGNORE_OUTPUT;

  export type Constructor<P extends Parser = Parser> = new (
    parse: Parser.Fn<P>,
    toString: () => string,
  ) => P;

  /** Options object for `Parser.into()` */
  export type IntoOptions<P extends Parser> = {
    class?: Constructor<P>;
    toString?: () => string;
  };

  /** A Parser or a simpler type that can be trivially wrapped in a Parser. */
  export type ParserLike = Parser | string | RegExp;
  export type AsParsers<T extends ParserLike[]> = {
    [K in keyof T]: T[K] extends string ? StringParser<T[K]>
      : T[K] extends RegExp ? RegExpParser
      : T[K] extends Parser ? T[K]
      : never;
  };

  /** Extracts the non-IgnoreOutput values of each input parser, preserving
   * tuple order. */
  export type SequenceValue<P extends Parser[]> = P extends
    [infer Head extends Parser, ...infer Tail extends Parser[]]
    ? Value<Head> extends IgnoreOutput ? SequenceValue<Tail>
    : [Value<Head>, ...SequenceValue<Tail>]
    : [];

  export type Sequence<P extends Array<ParserLike>> = ArrayParser<
    SequenceValue<AsParsers<P>>
  >;
}

export class Parser<Val extends unknown = unknown> {
  public readonly parse: Parser.Fn<Parser<Val>>;

  static IGNORE_OUTPUT: Parser.IgnoreOutput = IGNORE_OUTPUT;
  static Error = class ParserError extends Error {
    constructor(cursor: TextCursor, expected: string | { toString(): string }) {
      super(`\nExpected: ${expected}\n${cursor.inspect()}`);
      this.name = "ParserError";
    }
  };

  constructor(parse: Parser.Fn<Parser<Val>>, readonly toString: () => string) {
    this.parse = parse.bind(this);
  }

  /** Make a parser that, upon failure, will return `value` and consume no input
   * instead of throwing an error.
   *
   * @example
   * const parser = string("hello").fallback("what???");
   * parser.parse("hello"); // "hello"
   * parser.parse("world"); // "what???" */
  fallback(value: Val): typeof this {
    return new (this.constructor as Parser.Constructor)(
      (input) => {
        try {
          return this.parse(input);
        } catch {
          return [value, new TextCursor(input)];
        }
      },
      () => `${this}.fallback(${value})`,
    ) as typeof this;
  }

  /** Shorthand for `this.fallback(undefined)`.
   *
   * @example
   * const parser = string("hello").optional;
   * parser.parse("hello"); // "hello"
   * parser.parse("world"); // undefined */
  get optional(): typeof this | Parser<undefined> {
    return this.fallback(undefined as Val);
  }

  /** A derived Parser returning a special symbol that `sequence()` will
   * ignore.
   *
   * @example
   * const parser = sequence("hello", string(" ").ignore, "world");
   * parser.parse("hello world"); // ["hello", "world"] */
  get ignore(): Parser<Parser.IgnoreOutput> {
    return this.into(() => IGNORE_OUTPUT, { toString: () => `${this}.ignore` });
  }

  throw(cursor: TextCursor, message?: string): never {
    throw new Parser.Error(cursor, message ?? this);
  }

  /** Make a parser that applies `fn` to the result value.
   *
   * ```ts
   * const parser = string("hello")
   *    .into((value) => value.toUpperCase());
   * ```
   *
   * Optionally, a constructor can be specified for instantiating the
   * parser, defaulting to the same class or subclass as `this`.
   *
   * ```ts
   * const parser = string("hello") // split into [first, remainder]
   *    .into((value) => [value[0], value.slice(1)], {
   *      class: ArrayParser // would have been StringParser
   *    });
   * ```
   *
   * Additionally, a custom `toString()` method can be specified for the new
   * parser, defaulting to `${this}.into(fn)`.
   *
   * ```ts
   * const parser = string("hello")
   *    .into((value) => value.toUpperCase(), {
   *      toString: () => `"HELLO"`
   *    })
   * ``` */
  into<NewValue, P extends Parser<NewValue>>(
    fn: (value: Val) => NewValue,
    opts?: Parser.IntoOptions<P>,
  ): P {
    const {
      class: constructor = this.constructor as Parser.Constructor<P>,
      toString = () => `${this}.into(${fn})`,
    } = opts ?? {};

    return new constructor(
      (input) => {
        const [value, cursor] = this.parse(input);

        return [fn(value) as Parser.Value<P>, cursor];
      },
      toString,
    ) as P;
  }

  /** Make a parser that returns `value`.
   *
   * @example
   * const parser = string("hello").as("got it");
   * parser.parse("hello"); // "got it" */
  as<NewValue>(value: NewValue): Parser<NewValue> {
    return this.into(() => value, { toString: () => `${this}.as(${value})` });
  }

  /** A derived Parser that returns `true` on success, `false` on failure.
   *
   * @example
   * const parser = string("hello").boolean;
   * parser.parse("hello"); // true
   * parser.parse("world"); // false */
  get boolean(): Parser<boolean> {
    return this.as(true).fallback(false);
  }

  /** Make a parser that fails if `badParser` succeeds.
   *
   * @example
   * const parser = string.inline.not(string("world"));
   * parser.parse("hello"); // ["hello", TextCursor]
   * parser.parse("world"); // throws */
  not(badParser: Parser): this {
    return new (this.constructor as Parser.Constructor<this>)(
      (input) => {
        try {
          badParser.parse(input);
        } catch {
          return this.parse(input) as Parser.Result<Parser.Value<this>>;
        }

        this.throw(new TextCursor(input));
      },
      () => `${this}.not(${badParser})`,
    );
  }

  /** Make a parser that succeeds if `this` then `next` succeed in order.
   *
   * @example
   * const parser = string("hello").then(string(" world"));
   * parser.parse("hello world"); // ["hello", " world"] */
  then<P extends Parser>(next: P): ArrayParser<[Val, Parser.Value<P>]> {
    return new ArrayParser(
      (input) => {
        const [value, cursor] = this.parse(input);
        const [nextValue, nextCursor] = next.parse(cursor);

        return [[value, nextValue as Parser.Value<P>], nextCursor];
      },
      () => `${this}.then(${next})`,
    );
  }

  /** A derived Parser that succeeds if `this` succeeds any number of times.
   *
   * @example
   * const parser = string("hello").zeroOrMore;
   * parser.parse("hellohello"); // ["hello", "hello"]
   * parser.parse("world"); // [] */
  get zeroOrMore(): ArrayParser<Val[]> {
    return new ArrayParser((input) => {
      const values: Val[] = [];
      let value, cursor = new TextCursor(input);

      while (true) {
        try {
          [value, cursor] = this.parse(cursor);

          values.push(value);
        } catch {
          break;
        }
      }

      return [values, cursor];
    }, () => `${this}.zeroOrMore()`);
  }

  /** A derived Parser that succeeds if `this` succeeds at least once.
   *
   * @example
   * const parser = string("hello").oneOrMore;
   * parser.parse("hellohello"); // ["hello", "hello"]
   * parser.parse("world"); // throws */
  get oneOrMore(): ArrayParser<[Val, ...Val[]]> {
    return this.then(this.zeroOrMore).into(
      ([first, rest]) => [first, ...rest],
      { toString: () => `${this}.oneOrMore()` },
    );
  }
}

/** A parser whose return value is a string. Adds special string methods to
 * the base Parser class.
 *
 * @example
 * const parser = new StringParser.fromStrings("A&E", "B&E");
 * parser.parse("A&E"); // ["A&E", TextCursor]
 * parser.split("&").parse("A&E"); // [["A&E"], TextCursor] */
export class StringParser<V extends string> extends Parser<V> {
  static fromStrings<T extends string>(...values: T[]): StringParser<T> {
    return new StringParser(
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

  /** If the parser matches, returns the matched string split by the given
   * separator.
   *
   * @example
   * const parser = string("A&E", "B&E");
   * parser.parse("A&E channel"); // ["A&E", TextCursor]
   * parser.split("&").parse("A&E channel"); // [["A", "E"], TextCursor] */
  split(separator: string): ArrayParser<string[]> {
    return this.into((value) => value.split(separator), {
      class: ArrayParser,
      toString: () => `${this}.split(${JSON.stringify(separator)})`,
    });
  }

  /** A derived Parser that matches `this` and trims its result.
   *
   * @example
   * const parser = string(" A&E ");
   * parser.parse(" A&E "); // " A&E "
   * parser.trim.parse(" A&E "); // "A&E" */
  get trim(): StringParser<string> {
    return this.into((value) => value.trim(), {
      toString: () => `${this}.trim()`,
    });
  }

  /** A derived Parser that matches `this` and trims its result's end.
   *
   * @example
   * const parser = string(" A&E ");
   * parser.parse(" A&E "); // " A&E "
   * parser.trimEnd.parse(" A&E "); // " A&E" */
  get trimEnd(): StringParser<string> {
    return this.into((value) => value.trimEnd(), {
      toString: () => `${this}.trimEnd()`,
    });
  }

  /** A derived Parser that matches `this` and trims its result's start.
   *
   * @example
   * const parser = string(" A&E ");
   * parser.parse(" A&E "); // " A&E "
   * parser.trimStart.parse(" A&E "); // "A&E "
   */
  get trimStart(): StringParser<string> {
    return this.into((value) => value.trimStart(), {
      toString: () => `${this}.trimStart()`,
    });
  }

  /** Make a Parser that matches `this` wraps its result in an Object under the
   * given key.
   *
   * @example
   * const parser = string("A&E").toObject("channel");
   * parser.parse("A&E"); // { channel: "A&E" } */
  toObject<K extends string | number | symbol>(
    key: K,
  ): Parser<Pretty<Record<K, V>>> {
    return this.into(
      (value) => ({ [key]: value }),
      {
        class: Parser,
        toString: () => `${this}.toObject(${JSON.stringify(key)})`,
      },
    );
  }
}

/** A parser whose return value is an array, with special array methods. */
export class ArrayParser<V extends unknown[]> extends Parser<V> {
  constructor(fn: Parser.Fn<ArrayParser<V>>, readonly toString: () => string) {
    super(fn, toString);
  }

  /** A derived Parser that matches `this` and flattens its result.
   *
   * @example
   * const parser = sequence("A", "B").zeroOrMore;
   *
   * parser.parse("ABAB") // [["A", "B"], ["A", "B"]]
   * parser.flat.parse("ABAB") // ["A", "B", "A", "B"] */
  get flat(): ArrayParser<Tuple.Flat<V>> {
    return this.into((val) => val.flat(), { toString: () => `${this}.flat()` });
  }

  /** Make a Parser that matches `this` but returns only the item at the given
   * index.
   *
   * @example
   * const parser = sequence("A", "B", "C").item(1)
   *   .parse("ABC") // "B" */
  item<N extends number>(index: N): Parser<V[N]> {
    return this.into((val) => val[index], {
      class: Parser,
      toString: () => `${this}.item(${index})`,
    });
  }

  /** Make a Parser that matches `this` but returns only the items at the given
   * indices.
   *
   * @example
   * const parser = sequence("A", "B", "C").items(0, 2)
   *   .parse("ABC") // ["A", "C"] */
  items<I extends Tuple.Index<V>[]>(
    ...indices: I
  ): ArrayParser<Tuple.FromIndices<V, I>> {
    return this.into((val) => indices.map((i) => val[i]), {
      toString: () => `${this}.items(${indices.join(", ")})`,
    });
  }

  /** Make a Parser that matches `this` with its items joined by the given
   * separator.
   *
   * @example
   * const parser = sequence("A", "B").join("&")
   *   .parse("AB") // "A&B" */
  join(separator: string): StringParser<string> {
    return this.into((val) => val.join(separator), {
      class: StringParser,
      toString: () => `${this}.join(${JSON.stringify(separator)})`,
    });
  }

  /** Make a Parser that matches `this` and wraps its items in an Object under
   * the given keys.
   *
   * @example
   * const parser = string("A", "B").toObject("first", "second");
   *   .parse("AB") // { first: "A", second: "B" } */
  toObject<K extends Tuple.Fill<V, Obj.Key>>(
    ...keys: K
  ): Parser<Obj.FromEntries<Tuple.Zip<K, V>>> {
    return this.into(
      (val) => Object.fromEntries(keys.map((key, i) => [key, val[i]])),
      {
        class: Parser,
        toString: () => `${this}.toObject(${keys.join(", ")})`,
      },
    );
  }
}

export class RegExpParser extends Parser<RegExpMatchArray> {
  constructor(
    fn: Parser.Fn<RegExpParser>,
    readonly toString: () => string,
    readonly patterns: RegExp[],
  ) {
    super(fn, toString);
  }

  static fromPatterns(patterns: RegExp[]): RegExpParser {
    return new RegExpParser(
      function (input): [RegExpMatchArray, TextCursor] {
        const cursor = new TextCursor(input);
        const str = cursor.remainder;

        for (const pattern of patterns) {
          const match = str.match(pattern);

          if (!match) continue;

          if (match.index !== 0) {
            const message = "pattern to match start of string.\n" +
              `Matched at index ${match.index} instead\n${this}`;

            this.throw(cursor, message);
          }

          return [match, cursor.move(match[0].length)];
        }

        this.throw(cursor);
      },
      () => `regexp(${patterns.map((pattern) => pattern.source).join(" | ")})`,
      patterns,
    );
  }

  /** A derived Parser that matches `this` and returns the full match.
   *
   * @example
   * const parser = regexp(/(\d)(\d)/)
   *
   * parser.parse("42") // ["42", "4", "2"]
   * parser.match.parse("42") // "42" */
  get match(): StringParser<string> {
    return new StringParser(
      (input) => {
        const [match, cursor] = this.parse(input);

        return [match[0], cursor];
      },
      () => `${this}.match`,
    );
  }

  /** Make a Parser that matches `this` but returns only the group at the given
   * index.
   *
   * @example
   * const parser = regexp(/(A)(B)/)
   *
   * parser.parse("AB") // ["AB", "A", "B"]
   * parser.group(1).parse("AB") // "A"
   * parser.group(2).parse("AB") // "B" */
  group(index: number): StringParser<string> {
    return this.into((match) => match[index], {
      class: StringParser,
      toString: () => `${this}.group(${index})`,
    });
  }

  /** Make a Parser that matches `this` but returns only the groups at the given
   * indices.
   *
   * @example
   * const parser = regexp(/(A)(B)(C)/)
   *
   * parser.parse("ABC") // ["ABC", "A", "B", "C"]
   * parser.groups(0, 2).parse("ABC") // ["A", "C"] */
  groups<I extends number[]>(
    ...indices: I
  ): ArrayParser<{ [K in keyof I]: I[K] extends number ? string : never }> {
    return this.into(
      (match) =>
        indices.length
          ? indices.map((index) => match[index])
          : [...match].slice(1),
      {
        class: ArrayParser,
        toString: () => `${this}.groups(${indices.join(", ")})`,
      },
    );
  }

  /** Make a Parser that matches `this` or any of the additional patterns.
   *
   * @example
   * const parser = regexp(/A/).or(/B/);
   * parser.parse("A"); // "A"
   * parser.parse("B"); // "B" */
  or(...additionalPatterns: RegExp[]): RegExpParser {
    return RegExpParser.fromPatterns(this.patterns.concat(additionalPatterns));
  }
}

/** @example
 * const parser = string("hello");
 * parser.parse("hello"); // ["hello", TextCursor]
 * parser.parse("world"); // throws Parser.Error */
export function string<T extends string>(...values: T[]): StringParser<T> {
  return StringParser.fromStrings(...values);
}

/** Make a Parser that matches the given parsers in order. Strings and RegExps
 * are converted to parsers using `string` and `regexp` respectively.
 *
 * @example
 * const parser = sequence(string("hello"), string("world"));
 * parser.parse("helloworld"); // [["hello", "world"], TextCursor] */
export function sequence<P extends Array<Parser.ParserLike>>(
  ...parserLikes: P
): Parser.Sequence<P> {
  const parsers = parserLikes.map((parserLike) =>
    typeof parserLike === "string"
      ? string(parserLike)
      : parserLike instanceof RegExp
      ? regexp(parserLike)
      : parserLike
  );

  return new ArrayParser((input) => {
    let value, cursor = new TextCursor(input);
    const values = [];

    for (const parser of parsers) {
      [value, cursor] = parser.parse(cursor);
      if (value !== IGNORE_OUTPUT) values.push(value);
    }

    return [values as Parser.SequenceValue<Parser.AsParsers<P>>, cursor];
  }, () => `array(${parsers.map((parser) => parser.toString()).join(", ")})`);
}

/** Make a Parser that matches the first of the given parsers to match.
 *
 * @example
 * const parser = any(string("hello"), string("world"));
 * parser.parse("hello"); // "hello"
 * parser.parse("world"); // "world" */
export function any<P extends Parser[]>(...parsers: P): P[number] {
  return new Parser(
    function (input): Parser.Result<Parser.Value<P>> {
      for (const parser of parsers) {
        try {
          return parser.parse(input) as Parser.Result<Parser.Value<P>>;
        } catch { /* Deferring to error below */ }
      }

      this.throw(new TextCursor(input));
    },
    () => `Parser.any(${parsers.join(", ")})`,
  );
}

/** Matches against the given regular expressions in order.
 *
 * Patterns are expected to match the start of the string and will throw
 * otherwise. Consider adding `^` to the start of your patterns.
 *
 * @example
 * const parser = regexp(/\d{3}-\d{3}-\d{4}/);
 * parser.parse("123-456-7890"); // "123-456-7890" */
export function regexp(...patterns: RegExp[]): RegExpParser {
  return RegExpParser.fromPatterns(patterns);
}

/** Matches one or more whitespace characters. */
export const whitespace = regexp(/^\s+/).match;
/** Matches a blank line. */
export const blankLine = regexp(/^\s*(\r|\n|\r\n)/).match;
/** Matches one or more non-newline characters. */
export const inlineString = regexp(/^[^\r\n]+/).match;
/** Matches the rest of the string. */
export const multilineString = regexp(/^[\s\S]+/).match;
/** Matches an empty string. */
export const end = regexp(/^$/).ignore;

string.whitespace = whitespace;
string.blankLine = blankLine;
string.inline = inlineString;
string.multiline = multilineString;
string.end = end;
