import { assertEquals, assertThrows, describe, it } from "../_deps/testing.ts";
import { dedent } from "./dedent.ts";

describe("dedent", () => {
  it('defaults to ""', () => assertEquals(dedent(""), ""));

  it("dedents single lines", () => assertEquals(dedent("  foo"), "foo"));

  it("dedents multiple lines", () =>
    assertEquals(dedent("  foo\n  bar"), "foo\nbar"));

  it("handles empty lines", () =>
    assertEquals(dedent("\n  foo\n\n  bar\n"), "\nfoo\n\nbar\n"));

  it("handles whitespace lines", () =>
    assertEquals(dedent("\n    foo\n  \n    bar\n"), "\nfoo\n\nbar\n"));

  it("handles mixed indentation", () =>
    assertEquals(dedent("  a\n   b\n    c"), "a\n b\n  c"));

  describe("options.indentation", () => {
    it("returns the indentation", () =>
      assertEquals(
        dedent("  a\n   b\n    c", { returnIndentation: true }),
        ["a\n b\n  c", "  "],
      ));

    it("reflects options.char", () =>
      assertEquals(
        dedent(
          "..a\n...b\n....c",
          { char: ".", returnIndentation: true },
        ),
        ["a\n.b\n..c", ".."],
      ));
  });

  describe("options.char", () => {
    it("can be configured", () =>
      assertEquals(
        dedent("XXa\nXXXb\nXXXXc", { char: "X" }),
        "a\nXb\nXXc",
      ));

    it("throws if char.len !== 1", () =>
      void assertThrows(() => dedent("a", { char: "ab" })));

    it("escapes regex", () =>
      assertEquals(
        dedent("..a\n...b\n....c", { char: "." }),
        "a\n.b\n..c",
      ));

    it("handles lines of char only", () =>
      assertEquals(
        dedent("....a\n..\n....c", { char: "." }),
        "a\n\nc",
      ));
  });
});
