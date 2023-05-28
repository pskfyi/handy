import { consoleWidth } from "../cli/consoleSize.ts";
import { TextCursor } from "../string/TextCursor.ts";
import { escapeTerse } from "../string/escape.ts";

/*--- Types ---*/

export type Value<P extends CoreParser | CoreParser[]> = //
  P extends CoreParser<infer T> ? T
    : P extends CoreParser<infer T>[] ? T
    : never;

export type Result<Val = unknown> = [value: Val, cursor: TextCursor];

export type Input = string | TextCursor;

export type Parse<P extends CoreParser> = //
  (this: P, input: Input) => Result<Value<P>>;

export type Constructor<P extends CoreParser = CoreParser> = //
  new (parse: Parse<P>, toString: () => string) => P;

/** A set of parsers which describe a language. Intended for use in `satisfies`
 * clauses.
 *
 * @example
 * export const number = {
 *   integer: regexp(/^-?\d+/).into(Number)
 * } satisfies Language; */
export type Language = Record<string, CoreParser>;

/*--- Classes ---*/

export class ParseError extends Error {
  constructor(cursor: TextCursor, expected: string | { toString(): string }) {
    super(`\nExpected: ${expected}\n${cursor.inspect()}`);
    this.name = "ParseError";
  }
}

/** Foundational parser class. For interoperability, subclass constructors
 * should take a `parse` function as their first argument and a `toString`
 * function as their second argument. */
export abstract class CoreParser<Val extends unknown = unknown> {
  public readonly parse: Parse<CoreParser<Val>>;

  constructor(parse: Parse<CoreParser<Val>>, readonly toString: () => string) {
    this.parse = parse.bind(this);
  }

  /** Clone `this` parser with a new `parse` function and optional `toString`
   * value. Respects subclasses. Used internally for methods that should respect
   * subclasses.
   *
   * @example
   * const parser = sequence("X", "Y", "Z"); // an ArrayParser
   *
   * const lastTwo = parser.derive( // still an ArrayParser
   *   (input) => {
   *     const [items, cursor] = parser.parse(input);
   *     return [items.slice(-2), cursor];
   *   },
   *   () => `${parser}.lastTwo`,
   * );
   *
   * lastTwo.parse("XYZ"); // [["Y", "Z"], TextCursor] */
  derive(parse: Parse<this>, toString?: () => string): this {
    return new (this.constructor as Constructor<this>)(
      parse ?? this.parse,
      toString ?? this.toString,
    );
  }

  throw(cursor: TextCursor, message?: string): never {
    throw new ParseError(cursor, message ?? this);
  }

  /** Make a parser that fails if `badParser` succeeds.
   *
   * @example
   * const parser = string.inline.not(string("world"));
   * parser.parse("hello"); // ["hello", TextCursor]
   * parser.parse("world"); // throws */
  not(badParser: CoreParser): this {
    type V = Value<this>;
    // deno-lint-ignore no-this-alias
    const parent = this;

    return this.derive(
      function (input): Result<V> {
        try {
          badParser.parse(input);
        } catch {
          return parent.parse(input) as Result<V>;
        }

        this.throw(new TextCursor(input));
      },
      () => `${this}.not(${badParser})`,
    );
  }

  /** Clone `this` parser with a new `toString` value.
   *
   * @example
   * const parser = string("hello")
   *
   * `${parser}`; // 'string("hello")'
   * `${parser.named("greeting")}`; // 'greeting' */
  named(name: string): this {
    return this.derive(this.parse, () => name);
  }

  /** Clone `this` parser but log its progress to the console.
   *
   * @example
   * const parser = string("hello").debug;
   * parser.parse("helloXYZ"); // "hello"
   * // Logs:
   * // ---------------------
   * // Parser:
   * // string("hello")
   * //
   * // Input:
   * // "helloXYZ"
   * //
   * // Result:
   * // { value: "hello" }
   * // helloXYZ
   * //      ^ */
  get debug(): this {
    return this.derive((input) => {
      console.log("-".repeat(consoleWidth(80)));

      console.log("Parser:");
      console.log(this);
      console.log();

      console.log("Input:");
      console.log(typeof input === "string" ? escapeTerse(input) : input);
      console.log();

      const [value, cursor] = this.parse(input);

      console.log("Result:");
      console.log({ value });
      console.log(cursor);

      return [value as Value<this>, cursor];
    });
  }

  [Symbol.for("Deno.customInspect")](): string {
    return this.toString();
  }
}
