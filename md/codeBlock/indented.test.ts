import {
  assertEquals,
  assertThrows,
  describe,
  test,
} from "../../_deps/testing.ts";
import { create, findAll, parse } from "./indented.ts";

function assertParse(code: string, expected: string): void {
  assertEquals(parse(code).code, expected);
}

test("create", () => {
  assertEquals(create("foo"), "    foo");
  assertEquals(create("foo\n  bar\nbaz"), "    foo\n      bar\n    baz");
});

describe("parse", () => {
  test("invalid input", () => void assertThrows(() => parse("")));
  test(".type", () => assertEquals(parse("    X").type, "indented"));

  describe("result.code", () => {
    test("single lines", () => assertParse("    foo", "foo"));
    test("extra indents", () => assertParse("      foo", "foo"));
    test("multiple lines", () => assertParse("    foo\n    bar", "foo\nbar"));
    test("mixed indents", () => assertParse("     foo\n    bar", " foo\nbar"));
    test("blank lines", () => assertParse("    X\n\n\n    Y", "X\n\n\nY"));
  });
});

const type = "indented";

test("findAll", () =>
  assertEquals(
    findAll(
      "ex\n    foo\n\n    bar\n\n```baz\nqux\n```\n" +
        "      quux\n\n```corge\ngrault\n```",
    ),
    [
      [
        { code: "foo\n\nbar", type },
        { column: 1, line: 2, offset: 3 },
      ],
      [
        { code: "  quux", type },
        { column: 1, line: 9, offset: 36 },
      ],
    ],
  ));
