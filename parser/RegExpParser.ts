import { TextCursor } from "../string/TextCursor.ts";
import { ArrayParser, Parser } from "./Parser.ts";
import { CoreParser, Parse } from "./core.ts";

/** A parser whose return value is a `RegExpMatchArray`, with special
 * methods. */
export class RegExpParser extends Parser<RegExpMatchArray> {
  constructor(
    parse: Parse<RegExpParser>,
    override readonly toString: () => string,
    readonly patterns: RegExp[],
  ) {
    super(parse as Parse<CoreParser>, toString);
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
  get match(): Parser<string> {
    return new Parser(
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
  group(index: number): Parser<string> {
    return this.into((match) => match[index], {
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
        (indices.length
          ? indices.map((index) => match[index])
          : [...match].slice(1)) as {
            [K in keyof I]: I[K] extends number ? string : never;
          },
      {
        class: ArrayParser,
        toString: () => `${this}.groups(${indices.join(", ")})`,
      },
    );
  }
}
