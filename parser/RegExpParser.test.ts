import { assert, assertEquals, test } from "../_deps/testing.ts";
import { ArrayParser, Parser } from "./Parser.ts";
import { RegExpParser } from "./RegExpParser.ts";
import { assertParseResult } from "./asserts.ts";

function regexp(pattern: RegExp): RegExpParser {
  return RegExpParser.fromPatterns([pattern]);
}

test(".fromPatterns()", () => {
  assert(RegExpParser.fromPatterns([/\S/]) instanceof RegExpParser);
  assert(RegExpParser.fromPatterns([/\s/, /\d/]) instanceof RegExpParser);
});

test(".patterns", () =>
  assertEquals(RegExpParser.fromPatterns([/\S/]).patterns, [/\S/]));

test("multiple patterns", () => {
  const parser = RegExpParser.fromPatterns([/\s/, /\d/]);

  assertParseResult(parser.match.parse(" 42"), " ", "42");
  assertEquals(parser.patterns, [/\s/, /\d/]);
});

test(".match", () => {
  const parser = regexp(/\d/).match;

  assert(parser instanceof Parser);
  assertParseResult(parser.parse("42"), "4", "2");
});

test(".group()", () => {
  const parser = regexp(/(\d)(\d)/).group(2);

  assert(parser instanceof Parser);
  assertParseResult(parser.parse("42"), "2");
});

test(".groups()", () => {
  const parser = regexp(/(\d)(\d)/).groups(1, 2);

  assert(parser instanceof ArrayParser);
  assertParseResult(parser.parse("42"), ["4", "2"]);
});
