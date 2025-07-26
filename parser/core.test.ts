import { assert, assertEquals, assertThrows } from "@std/assert";
import { test } from "@std/testing/bdd";
import { TextCursor } from "../string/TextCursor.ts";
import { assertParseResult } from "./asserts.ts";
import {
  Constructor,
  CoreParser,
  Parse,
  ParseError,
  Result,
  Value,
} from "./core.ts";

class ExampleParser extends CoreParser<string> {
  constructor(
    parse?: Parse<CoreParser<string>>,
    toString?: () => string,
  ) {
    parse ??= (input: string | TextCursor) => ["foo", new TextCursor(input)];
    toString ??= () => "example";

    super(parse, toString);
  }

  static fromString(str: string): ExampleParser {
    return new ExampleParser(
      function (input): [string, TextCursor] {
        const cursor = new TextCursor(input);

        if (input.startsWith(str)) {
          return [str, cursor.move(str.length)];
        }

        this.throw(cursor);
      },
    );
  }
}

function exampleParser(str: string): ExampleParser {
  return ExampleParser.fromString(str);
}

test("types", () => {
  const _parse: Parse<ExampleParser> = new ExampleParser().parse;
  const _parseValue: Value<ExampleParser> = "foo";
  const _parseResult: Result<"foo"> = ["foo", new TextCursor("")];
  const _parserConstructor: Constructor<ExampleParser> = ExampleParser;
});

test(".derive()", () => {
  const parser = new ExampleParser();
  const derived = parser.derive(
    (input) => ["foo", new TextCursor(input)],
    () => "derived",
  );

  assert(derived instanceof ExampleParser);
  assertEquals(derived.toString(), "derived");
});

test(".throw()", () => {
  const parser = new ExampleParser();

  assertThrows(
    () => parser.throw(new TextCursor("")),
    ParseError,
    "example",
  );
});

test(".not()", () => {
  const parser = exampleParser("X").not(exampleParser("XX"));

  assertParseResult(parser.parse("X"), "X");
  assertThrows(
    () => parser.parse("XX"),
    ParseError,
    "example.not(example)",
  );
});

test(".named()", () => {
  const x = exampleParser("X");
  const named = x.named("named");

  assertEquals(`${x}`, "example");
  assertEquals(`${named}`, "named");
});

test(".debug", () => {
  const parser = exampleParser("XX");

  assert(parser instanceof ExampleParser);
  assert(parser.debug instanceof ExampleParser);
});
