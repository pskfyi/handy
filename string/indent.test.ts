import { assertEquals, describe, test } from "../_deps/testing.ts";
import { indent } from "./indent.ts";

describe("indent", () => {
  test("defaults", () => assertEquals(indent("", ""), ""));

  test("single lines", () => assertEquals(indent("foo", " "), " foo"));

  test("multiple lines", () =>
    assertEquals(
      indent("foo\n bar\nbaz\n  qux", " "),
      " foo\n  bar\n baz\n   qux",
    ));

  test("indentation parameter", () => {
    assertEquals(indent("foo", 2), "  foo");
    assertEquals(indent("foo", ".."), "..foo");
  });
});
