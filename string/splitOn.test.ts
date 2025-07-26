import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { splitOn, splitOnFirst } from "./splitOn.ts";

describe("splitOnFirst", () => {
  it("splits on first space", () =>
    assertEquals(splitOnFirst(" ", "foo bar baz"), ["foo", "bar baz"]));

  it("splits on first slash", () =>
    assertEquals(splitOnFirst("/", "a/b/c/d"), ["a", "b/c/d"]));

  describe("result", () => {
    it('is [str, ""] w/o sep', () =>
      assertEquals(splitOnFirst("", "foo"), ["foo", ""]));

    it('is ["", ""] w/o str', () =>
      assertEquals(splitOnFirst("X", ""), ["", ""]));

    it('is [str, ""] w/o match', () =>
      assertEquals(splitOnFirst("X", "foo"), ["foo", ""]));
  });
});

describe("splitOn", () => {
  it("splits on first space", () =>
    assertEquals(splitOn(1, " ", "foo bar baz"), ["foo", "bar baz"]));

  it("splits on third newline", () =>
    assertEquals(splitOn(3, "\n", "a\nb\nc\nd\ne"), ["a", "b", "c", "d\ne"]));

  describe("result", () => {
    it("is str when count 0", () =>
      assertEquals(splitOn(0, "X", "foo"), ["foo"]));

    it("is str when no sep", () =>
      assertEquals(splitOn(1, "", "foo"), ["foo"]));

    it("is str w/o match", () => assertEquals(splitOn(1, "X", "foo"), ["foo"]));
  });
});
