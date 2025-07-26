import { assertEquals } from "@std/assert";
import { describe, test } from "@std/testing/bdd";
import { globRoot } from "./globRoot.ts";

function assertGlobRoot(input: string, expected: string): void {
  assertEquals(globRoot(input), expected);
}

describe("w/ Unix separators", () => {
  test("absolute globs", () => assertGlobRoot("/foo/bar/*.ts", "/foo/bar/"));
  test("relative globs", () => assertGlobRoot("foo/bar/*.ts", "foo/bar/"));
  test("non-globs", () => assertGlobRoot("/foo/bar/", "/foo/bar/"));
});

describe("w/ Windows separators", () => {
  test("absolute globs", () => assertGlobRoot("C:\\\\X\\*.ts", "C:\\\\X\\"));
  test("relative globs", () => assertGlobRoot("foo\\bar\\*.ts", "foo\\bar\\"));
  test("non-globs", () => assertGlobRoot("C:\\\\foo\\", "C:\\\\foo\\"));
});
