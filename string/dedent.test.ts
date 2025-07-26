import { assertEquals, assertThrows } from "@std/assert";
import { describe, it, test } from "@std/testing/bdd";
import { dedent } from "./dedent.ts";

function assertDedent(input: string, expected: string): void {
  assertEquals(dedent(input), expected);
}

test('defaults is ""', () => assertDedent("", ""));
test("single lines", () => assertDedent("  foo", "foo"));
test("multiple lines", () => assertDedent("  foo\n  bar", "foo\nbar"));
test("empty lines", () => assertDedent("\n  foo\n\n  bar\n", "\nfoo\n\nbar\n"));
test("whitespace lines", () => assertDedent("\n    X\n  \n    Y", "\nX\n\nY"));
test("mixed indents", () => assertDedent("  a\n   b\n    c", "a\n b\n  c"));

describe("options.indentation", () => {
  it("returns the indent", () =>
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

  it("throws if char.len > 1", () =>
    void assertThrows(() => dedent("a", { char: "ab" })));

  it("throws if char.len = 0", () =>
    void assertThrows(() => dedent("a", { char: "" })));

  it("escapes regex", () =>
    assertEquals(
      dedent("..a\n...b\n....c", { char: "." }),
      "a\n.b\n..c",
    ));

  it("handles char-only line", () =>
    assertEquals(
      dedent("....a\n..\n....c", { char: "." }),
      "a\n\nc",
    ));
});
