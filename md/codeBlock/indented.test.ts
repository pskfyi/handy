import {
  assertEquals,
  assertThrows,
  describe,
  it,
} from "../../_deps/testing.ts";
import { create, findAll, parse } from "./indented.ts";

describe("create", () => {
  it("handles single-line code", () => assertEquals(create("foo"), "    foo"));

  it("handles multi-line code", () =>
    assertEquals(create("foo\n  bar\nbaz"), "    foo\n      bar\n    baz"));
});

describe("parse", () => {
  it("throws if input is invalid", () => void assertThrows(() => parse("")));

  it('has result.type "indented"', () =>
    assertEquals(parse("    ").type, "indented"));

  describe("result.code", () => {
    it('defaults to ""', () => assertEquals(parse("    ").code, ""));

    it("gets code from one-line blocks", () =>
      assertEquals(parse("    foo").code, "foo"));

    it("handles increased indentation", () =>
      assertEquals(parse("      foo").code, "foo"));

    it("gets code from multi-line blocks", () =>
      assertEquals(parse("    foo\n    bar").code, "foo\nbar"));

    it("handles mixed indentation", () =>
      assertEquals(parse("     foo\n    bar").code, " foo\nbar"));

    it("trims trailing whitespace", () =>
      assertEquals(
        parse("    foo \n    bar\n\n\n").code,
        "foo\nbar",
      ));

    it("trims leading blank lines", () =>
      assertEquals(
        parse("\n\n\n    foo\n    bar").code,
        "foo\nbar",
      ));

    it("includes intermediate blank lines", () =>
      assertEquals(
        parse("    foo\n\n\n    bar").code,
        "foo\n\n\nbar",
      ));
  });

  it("has result.indentation", () =>
    assertEquals(parse("      foo").indentation, "      "));
});

describe("findAll", () => {
  it("finds all code blocks in a string", () =>
    assertEquals(
      findAll(
        "ex\n    foo\n\n    bar\n\n```baz\nqux\n```\n" +
          "      quux\n\n```corge\ngrault\n```",
      ),
      ["    foo\n\n    bar", "      quux"],
    ));
});
