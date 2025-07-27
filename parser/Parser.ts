import type { Tuple } from "../array/types.ts";
import type { Obj } from "../object/types.ts";
import type { Text } from "../string/Text.ts";
import { TextCursor } from "../string/TextCursor.ts";
import {
  type Constructor,
  CoreParser,
  type Parse,
  type Result,
  type Value,
} from "./core.ts";
import { IgnoredParser, type NonIgnored } from "./ignored.ts";

export type ParseNode<Val> = {
  value: Val;
  start: Text.Location;
  end: Text.Location;
};

/** Baseline parser class for parsers that return a single value. */
// deno-lint-ignore no-explicit-any
export class Parser<Val extends any = any> extends CoreParser<Val> {
  /** A derived Parser returning a special symbol that `sequence()` will
   * ignore.
   *
   * @example
   * const parser = sequence("hello", string(" ").ignore, "world");
   * parser.parse("hello world"); // ["hello", "world"] */
  get ignore(): IgnoredParser {
    return new IgnoredParser(this.parse, () => `${this}.ignore`);
  }

  /** A derived parser that, upon failure, will return `value` and consume no
   * input instead of throwing an error.
   *
   * @example
   * const parser = string("hello").fallback("what???");
   * parser.parse("hello"); // "hello"
   * parser.parse("world"); // "what???" */
  fallback(value: Val): this {
    type V = Value<this>;

    return this.derive(
      (input) => {
        try {
          return this.parse(input) as Result<V>;
        } catch {
          return [value as V, new TextCursor(input)];
        }
      },
      () => `${this}.fallback(${value})`,
    );
  }

  /** A derived parser that, upon failure, will return `undefined` and consume
   * no input instead of throwing an error.
   *
   * @example
   * const parser = string("hello").optional;
   * parser.parse("hello"); // "hello"
   * parser.parse("world"); // undefined */
  get optional(): typeof this | Parser<undefined> {
    return this.fallback(undefined as Value<this>);
  }

  /** Make a parser that applies `fn` to the result value.
   *
   * ```ts
   * const parser = string("hello")
   *    .into((value) => value.toUpperCase());
   * ```
   *
   * Optionally, a constructor can be specified for instantiating the
   * parser, defaulting to `Parser`.
   *
   * ```ts
   * const parser = string("hello") // split into [first, remainder]
   *    .into((value) => [value[0], value.slice(1)], {
   *      class: ArrayParser
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
  into<NewValue, P extends Parser<NewValue>, C extends Constructor<P>>(
    fn: (value: Val) => NewValue,
    opts?: { class?: C; toString?: () => string },
  ): P {
    const {
      class: constructor = Parser,
      toString = () => `${this}.into(${fn})`,
    } = opts ?? {};

    return new constructor((input) => {
      const [value, cursor] = this.parse(input);

      return [fn(value) as Value<P>, cursor];
    }, toString) as P;
  }

  /** Make a parser that returns `value`.
   *
   * @example
   * const parser = string("hello").as("got it");
   * parser.parse("hello"); // "got it" */
  as<NewValue>(value: NewValue): Parser<NewValue> {
    return this.into(() => value, { toString: () => `${this}.as(${value})` });
  }

  /** Make a parser that returns `true` if `this` succeeds, `false` otherwise.
   *
   * @example
   * const parser = string("hello").boolean;
   * parser.parse("hello"); // true
   * parser.parse("world"); // false */
  get boolean(): Parser<boolean> {
    return this.as(true).fallback(false).named(`${this}.boolean`);
  }

  /** Make a parser that succeeds if `this` succeeds and `assertion` returns a
   * truthy value.
   *
   * @example
   * const parser = string("X").oneOrMore.if((val) => val.length > 2);
   *
   * parser.parse("XXX"); // ["X", "X", "X"]
   * parser.parse("X"); // throws */
  if(assertion: (val: Val) => unknown): this {
    return this.derive(
      (input) => {
        const [value, cursor] = this.parse(input);

        if (!assertion(value)) this.throw(cursor);

        return [value as Value<this>, cursor];
      },
      () => `${this}.if(${assertion})`,
    );
  }

  /** Make a parser that succeeds if `this` then `next` succeed in order.
   *
   * @example
   * const parser = string("hello").and(string(" world"));
   * parser.parse("hello world"); // ["hello", " world"] */
  and<P extends CoreParser>(next: P): ArrayParser<[Val, Value<P>]> {
    return new ArrayParser(
      (input) => {
        const [value, cursor] = this.parse(input);
        const [nextValue, nextCursor] = next.parse(cursor);

        return [[value, nextValue as Value<P>], nextCursor];
      },
      () => `${this}.and(${next})`,
    );
  }

  /** Make a parser that succeeds if `this` or any of the given `parsers`
   * succeed.
   *
   * @example
   * const parser = string("X").or(string("Y"));
   * parser.parse("X"); // "X"
   * parser.parse("Y"); // "Y"
   * parser.parse("Z"); // throws */
  or<P extends CoreParser[]>(...parsers: P): Parser<Val | Value<P>> {
    // deno-lint-ignore no-this-alias
    const thisParser = this;

    return new Parser(function (input): Result<Val | Value<P>> {
      for (const parser of [thisParser, ...parsers]) {
        try {
          return parser.parse(input) as Result<Val | Value<P>>;
        } catch { /* Deferred to below */ }
      }

      this.throw(new TextCursor(input));
    }, () => `${this}.or(${parsers.join(", ")})`);
  }

  /** Make a parser that succeeds at least `this` or `next` succeed in order.
   *
   * @example
   * const parser = string("X").andOr(string("Y"));
   *
   * parser.parse("XY"); // ["X", "Y"]
   * parser.parse("X"); // ["X"]
   * parser.parse("Y"); // ["Y"]
   * parser.parse("Hello!"); // throws
   * parser.parse("YX"); // throws */
  andOr<P extends CoreParser>(
    next: P,
  ): ArrayParser<[Val] | [Value<P>] | [Val, Value<P>]> {
    const parse = this.parse.bind(this);

    return new ArrayParser(
      function (
        input,
      ): Result<[Val] | [Value<P>] | [Val, Value<P>]> {
        const values = [];
        let cursor = new TextCursor(input);

        try {
          const [value, newCursor] = parse(cursor);
          cursor = newCursor;

          values.push(value);
        } catch { /* Deferred to below */ }

        try {
          const [value, newCursor] = next.parse(cursor);
          cursor = newCursor;

          values.push(value);
        } catch { /* Deferred to below */ }

        if (!values.length) this.throw(cursor);

        return [
          values as [Val] | [Value<P>] | [Val, Value<P>],
          cursor,
        ];
      },
      () => `${this}.andOr(${next})`,
    );
  }

  /** A derived Parser that succeeds if `this` succeeds any number of times.
   *
   * @example
   * const parser = string("hello").zeroOrMore;
   * parser.parse("hellohello"); // ["hello", "hello"]
   * parser.parse("world"); // [] */
  get zeroOrMore(): ArrayParser<NonIgnored<Val>[]> {
    return new ArrayParser((input) => {
      const values: NonIgnored<Val>[] = [];
      let value, cursor = new TextCursor(input);

      while (cursor.index < cursor.length) {
        try {
          [value, cursor] = this.parse(cursor);

          if (value !== IgnoredParser.SYMBOL) {
            values.push(value as NonIgnored<Val>);
          }
        } catch {
          break;
        }
      }

      return [values, cursor];
    }, () => `${this}.zeroOrMore`);
  }

  /** A derived Parser that succeeds if `this` succeeds at least once.
   *
   * @example
   * const parser = string("hello").oneOrMore;
   * parser.parse("hellohello"); // ["hello", "hello"]
   * parser.parse("world"); // throws */
  get oneOrMore(): ArrayParser<[Val, ...Val[]]> {
    return this.and(this.zeroOrMore).into(
      ([first, rest]) => [first, ...rest] as [Val, ...Val[]],
      { class: ArrayParser, toString: () => `${this}.oneOrMore` },
    );
  }

  /** A derived Parser that casts the result value to an object with `start`
   * and `end` cursors.
   *
   * @example
   * const parser = string("hello").node;
   * parser.parse("hello");
   * // { value: "hello", start: TextCursor, end: TextCursor } */
  get node(): Parser<ParseNode<Val>> {
    return new Parser((input) => {
      const [value, cursor] = this.parse(input);
      const start = new TextCursor(input).location;
      const end = cursor.location;

      return [{ value, start, end }, cursor];
    }, () => `${this}.node`);
  }
}

/** A parser whose return value is an array, with special array methods. */
export class ArrayParser<V extends readonly unknown[]> extends Parser<V> {
  constructor(
    parse: Parse<ArrayParser<V>>,
    override readonly toString: () => string,
  ) {
    super(parse as Parse<CoreParser<V>>, toString);
  }

  /** A derived Parser that matches `this` and flattens its result.
   *
   * @example
   * const parser = sequence("A", "B").zeroOrMore;
   *
   * parser.parse("ABAB") // [["A", "B"], ["A", "B"]]
   * parser.flat.parse("ABAB") // ["A", "B", "A", "B"] */
  get flat(): ArrayParser<Tuple.Flat<V>> {
    return this.into((val) => val.flat() as Tuple.Flat<V>, {
      class: ArrayParser,
      toString: () => `${this}.flat`,
    });
  }

  /** Make a Parser that matches `this` but returns only the item at the given
   * index.
   *
   * @example
   * const parser = sequence("A", "B", "C").item(1)
   *   .parse("ABC") // "B" */
  item<N extends Tuple.Index<V>>(index: N): Parser<V[N]> {
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
    return this
      .into((val) => indices.map((i) => val[i]) as Tuple.FromIndices<V, I>, {
        class: ArrayParser,
        toString: () => `${this}.items(${indices.join(", ")})`,
      });
  }

  /** Make a Parser that matches `this` with its items joined by the given
   * separator.
   *
   * @example
   * const parser = sequence("A", "B").join("&")
   *   .parse("AB") // "A&B" */
  join(separator = ""): Parser<string> {
    return this.into((val) => val.join(separator), {
      toString: () => `${this}.join(${JSON.stringify(separator)})`,
    });
  }

  /** Make a Parser that matches `this` and wraps its items in an Object under
   * the given keys.
   *
   * @example
   * const parser = sequence("A", "B").toObject("first", "second");
   *   .parse("AB") // { first: "A", second: "B" } */
  toObject<
    K extends string[] = Tuple.Fill<V, string>,
  >(
    ...keys: K
  ): Parser<Obj.FromEntries<Tuple.Zip<K, V>>> {
    return this.into(
      (val) => Object.fromEntries(keys.map((key, i) => [key, val[i]])),
      { toString: () => `${this}.toObject(${keys.join(", ")})` },
    );
  }
}
