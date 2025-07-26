import { assert, assertThrows } from "@std/assert";
import { describe, test } from "@std/testing/bdd";
import { TextCursor } from "../string/TextCursor.ts";
import { ArrayParser, Parser } from "./Parser.ts";
import { assertParseResult } from "./asserts.ts";
import { IgnoredParser } from "./ignored.ts";

function string(str: string): Parser {
  return new Parser(
    function (input): [string, TextCursor] {
      const cursor = new TextCursor(input);

      if (cursor.startsWith(str)) {
        return [str, cursor.move(str.length)];
      }

      this.throw(cursor);
    },
    () => `example(${JSON.stringify(str)})`,
  );
}

describe("Parser", () => {
  test(".ignore", () => assert(string("").ignore instanceof IgnoredParser));

  test(".fallback()", () => {
    const parser = string("X").fallback("Y");

    assert(parser instanceof Parser);
    assertParseResult(parser.parse("X"), "X");
    assertParseResult(parser.parse("Z"), "Y", "Z");
  });

  test(".optional", () => {
    const parser = string("X").optional;

    assert(parser instanceof Parser);
    assertParseResult(parser.parse("X"), "X");
    assertParseResult(parser.parse("Z"), undefined, "Z");
  });

  test(".into()", () => {
    const parser = string("X").into((str) => str.length);

    assert(parser instanceof Parser);
    assertParseResult(parser.parse("X"), 1);
  });

  test(".as()", () => {
    const parser = string("X").as("Y");

    assert(parser instanceof Parser);
    assertParseResult(parser.parse("X"), "Y");
  });

  test(".boolean", () => {
    const parser = string("X").boolean;

    assert(parser instanceof Parser);
    assertParseResult(parser.parse("X"), true);
    assertParseResult(parser.parse("Y"), false, "Y");
  });

  test(".if()", () => {
    assert(string("X").if(() => true) instanceof Parser);
    assertParseResult(string("X").if(() => true).parse("X"), "X");
    assertThrows(() => string("X").if(() => false).parse("X"));
  });

  test(".and()", () => {
    const parser = string("X").and(string("Y"));

    assert(parser instanceof ArrayParser);
    assertParseResult(parser.parse("XY"), ["X", "Y"]);
    assertThrows(() => parser.parse("XZ"));
  });

  test(".or()", () => {
    const parser = string("X").or(string("Y"));

    assert(parser instanceof Parser);
    assertParseResult(parser.parse("X"), "X");
    assertParseResult(parser.parse("Y"), "Y");
    assertThrows(() => parser.parse("Z"));
  });

  test(".andOr()", () => {
    const parser = string("X").andOr(string("Y"));

    assert(parser instanceof ArrayParser);
    assertParseResult(parser.parse("X"), ["X"]);
    assertParseResult(parser.parse("Y"), ["Y"]);
    assertParseResult(parser.parse("XY"), ["X", "Y"]);
    assertThrows(() => parser.parse("Z"));
  });

  test(".zeroOrMore", () => {
    const parser = string("X").zeroOrMore;

    assert(parser instanceof ArrayParser);
    assertParseResult(parser.parse("X"), ["X"]);
    assertParseResult(parser.parse("XX"), ["X", "X"]);
    assertParseResult(parser.parse("Y"), [], "Y");
  });

  test(".oneOrMore", () => {
    const parser = string("X").oneOrMore;

    assert(parser instanceof ArrayParser);
    assertParseResult(parser.parse("X"), ["X"]);
    assertParseResult(parser.parse("XX"), ["X", "X"]);
    assertThrows(() => parser.parse("Y"));
  });

  test(".node", () => {
    const parser = string("X").node;

    assert(parser instanceof Parser);
    assertParseResult(parser.parse("X"), {
      value: "X",
      start: { column: 1, line: 1, offset: 0 },
      end: { column: 2, line: 1, offset: 1 },
    });
  });
});

describe("ArrayParser", () => {
  const xs = string("X").oneOrMore;
  const ys = string("Y").oneOrMore;

  test(".flat", () => {
    const parser = xs.and(ys);

    assert(parser instanceof ArrayParser);
    assertParseResult(parser.parse("XXYY"), [["X", "X"], ["Y", "Y"]]);

    const flattened = parser.flat;

    assert(flattened instanceof ArrayParser);
    assertParseResult(flattened.parse("XXYY"), ["X", "X", "Y", "Y"]);
  });

  test(".item()", () => {
    assertParseResult(xs.parse("XXX"), ["X", "X", "X"]);
    assertParseResult(xs.item(1).parse("XXX"), "X");
  });

  test(".items()", () => {
    const parser = string("X").or(string("Y")).oneOrMore;

    assertParseResult(parser.parse("XYX"), ["X", "Y", "X"]);
    assertParseResult(parser.items(1, 2).parse("XYX"), ["Y", "X"]);
  });

  test(".join()", () => {
    const parser = string("X").or(string("Y")).oneOrMore;

    assertParseResult(parser.parse("XYX"), ["X", "Y", "X"]);
    assertParseResult(parser.join().parse("XYX"), "XYX");
    assertParseResult(parser.join("|").parse("XYX"), "X|Y|X");
  });

  test(".toObject()", () => {
    const char = string("X").or(string("Y"));
    const parser = char.and(char).toObject("first", "second");

    assertParseResult(parser.parse("XY"), { first: "X", second: "Y" });
  });
});
