import {
  assert,
  assertEquals,
  assertThrows,
  describe,
  it,
} from "../_deps/testing.ts";
import {
  ArrayParser,
  Parser,
  regexp,
  sequence,
  string,
  StringParser,
} from "./combinator.ts";
import { assertParseResult } from "./asserts.ts";
import { TextCursor } from "../string/TextCursor.ts";

describe("Parser namespace", () => {
  const cursor = new TextCursor("");

  // commonly used
  const _fn: Parser.Fn<Parser> = (i: string | TextCursor) => [i, cursor];
  const _result: Parser.Result<number> = [0, cursor];
  const _value: Parser.Value<Parser<2>> = 2;
  const _ignoreSymbol: Parser.IgnoreOutput = Parser.IGNORE_OUTPUT;

  // rarely used
  const _sequence: Parser.Sequence<["", Parser<boolean>]> = sequence(
    "",
    string("X").boolean,
  );
  const _sequenceValue: Parser.SequenceValue<[Parser<"">, Parser<boolean>]> = [
    "",
    true,
  ];

  // advanced uses only
  const _constructor: Parser.Constructor<StringParser<string>> = StringParser;
  const _parserLike: Parser.ParserLike = "X";
  const _asParsers: Parser.AsParsers<["X"]> = [string("X")];
});

describe("Parser.prototype.parse()", () => {
  it("can parse strings", () =>
    assertParseResult(
      string("X").parse("X"),
      "X",
    ));
});

describe("Parser.prototype.fallback()", () => {
  it("works normally on success", () =>
    assertParseResult(
      string("A" as string).fallback("B").parse("A"),
      "A",
    ));

  it("returns the fallback on fail", () =>
    assertParseResult(
      string("A" as string).fallback("B").parse("C"),
      "B",
      "C",
    ));
});

describe("Parser.prototype.ignore", () => {
  it("returns Parser.IGNORE_OUTPUT", () =>
    assertParseResult(
      string("X").ignore.parse("X"),
      Parser.IGNORE_OUTPUT,
    ));
});

describe("Parser.prototype.throw()", () => {
  it("throws a Parser.Error", () =>
    void assertThrows(() => string().throw(new TextCursor("")), Parser.Error));
});

describe("Parser.prototype.not()", () => {
  it("doesn't match the second parser", () => {
    const parser = regexp(/\S/).match.not(string("Y"));
    assertParseResult(parser.parse("X"), "X");
    assertThrows(() => parser.parse("Y"), Parser.Error);
  });
});

describe("Parser.prototype.zeroOrMore()", () => {
  it("returns an ArrayParser", () =>
    assert(string("X").zeroOrMore instanceof ArrayParser));

  it("returns an empty array if the parser fails", () =>
    assertParseResult(
      string("X").zeroOrMore.parse("Y"),
      [],
      "Y",
    ));

  it("returns an array of matches", () =>
    assertParseResult(
      string("X").zeroOrMore.parse("XXX"),
      ["X", "X", "X"],
    ));
});

describe("Parser.prototype.oneOrMore()", () => {
  it("returns an ArrayParser", () =>
    assert(string("X").oneOrMore instanceof ArrayParser));

  it("throws if the parser fails", () =>
    void assertThrows(() => string("X").oneOrMore.parse("Y"), Parser.Error));

  it("returns an array of matches", () =>
    assertParseResult(
      string("X").oneOrMore.parse("XXX"),
      ["X", "X", "X"],
    ));
});

describe("string", () => {
  it("handles single strings", () =>
    assertParseResult(
      string("a").parse("ab"),
      "a",
      "b",
    ));

  it("handles multiple strings", () =>
    assertParseResult(
      string("a", "b").parse("bc"),
      "b",
      "c",
    ));

  it("can split strings", () =>
    assertParseResult(
      string("A&E").split("&").parse("A&E"),
      ["A", "E"],
    ));

  it("can re-join strings", () =>
    assertParseResult(
      string("A&E").split("&").join("|").parse("A&E channel"),
      "A|E",
      " channel",
    ));

  it("can split, join, and split again", () =>
    assertParseResult(
      string("A&E").split("&").join("|").split("|").parse("A&E channel"),
      ["A", "E"],
      " channel",
    ));
});

describe("sequence", () => {
  it("is an ArrayParser", () => assert(sequence() instanceof ArrayParser));

  it("accepts multiple parsers", () =>
    assertParseResult(
      sequence(string("A"), string("B"), string("C")).parse("ABC"),
      ["A", "B", "C"],
    ));

  it("accepts nested sequences", () =>
    assertParseResult(
      sequence(sequence(string("A"), string("B")), string("C")).parse("ABC"),
      [["A", "B"], "C"],
    ));

  it("can flatten arrays", () =>
    assertParseResult(
      sequence(sequence(string("A"), string("B")), string("C"))
        .flat.parse("ABC"),
      ["A", "B", "C"],
    ));

  it("can join flattened arrays", () =>
    assertParseResult(
      sequence(sequence(string("A"), string("B")), string("C"))
        .flat.join("|").parse("ABC"),
      "A|B|C",
    ));
});

describe("regexp.parse()", () => {
  it("returns a RegExpMatchArray", () =>
    assertEquals(
      regexp(/^\S/).parse("a"),
      ["a".match(/^\S/)!, new TextCursor("a", 1)],
    ));

  it("includes capture groups", () =>
    assertEquals(
      regexp(/^\S(\S)/).parse("ab"),
      ["ab".match(/^\S(\S)/)!, new TextCursor("ab", 2)],
    ));

  it("throws on invalid input", () =>
    void assertThrows(() => regexp(/^\S/).match.parse(" ")));

  it("doesn't match beyond start", () =>
    void assertThrows(() => regexp(/\S/).match.parse(" s")));
});

describe("regexp.match", () => {
  it("returns the match string", () =>
    assertEquals(
      regexp(/^\S/).match.parse("a"),
      ["a", new TextCursor("a", 1)],
    ));
});

describe("regexp.group()", () => {
  it("returns the given group", () =>
    assertEquals(
      regexp(/^(\S)\S(\S)/).group(1).parse("abc123"),
      ["a", new TextCursor("abc123", 3)],
    ));
});

describe("regexp.groups()", () => {
  it("can return all groups", () =>
    assertEquals(
      regexp(/^(\S)\S(\S)/).groups().parse("abc123"),
      [["a", "c"], new TextCursor("abc123", 3)],
    ));

  it("can return a subset of groups", () =>
    assertEquals(
      regexp(/^(\S)\S(\S)/).groups(2).parse("abc123"),
      [["c"], new TextCursor("abc123", 3)],
    ));
});

describe("regexp.or()", () => {
  it("matches either regexp", () => {
    const parser = regexp(/a/).or(/b/).match;
    assertEquals(parser.parse("a"), ["a", new TextCursor("a", 1)]);
    assertEquals(parser.parse("b"), ["b", new TextCursor("b", 1)]);
    assertThrows(() => parser.parse("c"));
  });
});
