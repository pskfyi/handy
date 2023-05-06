import { assertEquals, describe, it } from "../_deps/testing.ts";
import { globRoot } from "./globRoot.ts";

describe("w/ Unix separators", () => {
  it("finds root of an absolute glob pattern", () =>
    assertEquals(globRoot("/foo/bar/*.ts"), "/foo/bar/"));

  it("finds root of a relative glob pattern", () =>
    assertEquals(globRoot("foo/bar/*.ts"), "foo/bar/"));

  it("returns a non-glob path as-is", () =>
    assertEquals(globRoot("/foo/bar/"), "/foo/bar/"));
});

describe("w/ Windows separators", () => {
  it("finds root of an absolute glob pattern", () =>
    assertEquals(globRoot("C:\\\\foo\\bar\\*.ts"), "C:\\\\foo\\bar\\"));

  it("finds root of a relative glob pattern", () =>
    assertEquals(globRoot("foo\\bar\\*.ts"), "foo\\bar\\"));

  it("returns a non-glob path as-is", () =>
    assertEquals(globRoot("C:\\\\foo\\bar\\"), "C:\\\\foo\\bar\\"));
});
