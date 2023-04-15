import { assertEquals, describe, it } from "../deps/testing.ts";
import { indent } from "./indent.ts";

describe("indent", () => {
  it('defaults to ""', () => assertEquals(indent("", ""), ""));

  it("indents single lines", () => assertEquals(indent("foo", " "), " foo"));

  it("indents multiple lines", () =>
    assertEquals(
      indent("foo\n bar\nbaz\n  qux", " "),
      " foo\n  bar\n baz\n   qux",
    ));

  describe("indentation parameter", () => {
    it("can be a number", () => assertEquals(indent("foo", 2), "  foo"));
    it("can be a string", () => assertEquals(indent("foo", ".."), "..foo"));
  });
});
