import {
  assertEquals,
  assertThrows,
  describe,
  it,
  test,
} from "../../_deps/testing.ts";
import {
  InfoStringError,
  LanguageError,
  parse,
  stringify,
} from "./infoString.ts";

describe("stringify", () => {
  it('defaults to ""', () => assertEquals(stringify(), ""));

  it("has lang then meta", () =>
    assertEquals(stringify({ lang: "ts", meta: "foo" }), "ts foo"));

  test("lang w/ whitespace", () =>
    void assertThrows(() => stringify({ lang: "t s\n" }), LanguageError));

  describe("meta", () => {
    it("throws on newlines", () =>
      void assertThrows(() => stringify({ meta: "\n" }), InfoStringError));

    it("has fallback lang", () =>
      assertEquals(stringify({ meta: "foo" }), "nocode foo"));

    it("can ignore lang", () =>
      assertEquals(stringify({ meta: "foo", lang: "" }), "foo"));

    it("trims the value", () =>
      assertEquals(stringify({ meta: "  \t   foo     " }), "nocode foo"));
  });
});

describe("parse", () => {
  it("defaults to {}", () => assertEquals(parse(""), {}));

  it("reads first word as lang", () =>
    assertEquals(parse("foo bar baz qux").lang, "foo"));

  it("reads the rest as meta", () =>
    assertEquals(parse("foo bar baz qux").meta, "bar baz qux"));
});
