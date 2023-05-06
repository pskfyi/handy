import { assertEquals, describe, it } from "../_deps/testing.ts";
import { dir } from "./dir.ts";

describe("w/ string input", () => {
  describe("w/ Posix separators", () => {
    it("works on filepaths", () => assertEquals(dir("/foo/*.ts"), "/foo"));

    it("works on dirpaths", () => assertEquals(dir("/foo/bar/"), "/foo"));
  });

  describe("w/ Windows separators", () => {
    it("works on filepaths", () => assertEquals(dir("\\foo\\*.ts"), "\\foo"));

    it("works on dirpaths", () => assertEquals(dir("\\foo\\bar\\"), "\\foo"));
  });
});

describe("w/ URL input", () => {
  it("works on filepaths", () =>
    assertEquals(dir(new URL("file:///foo/*.ts")), "/foo"));

  it("works on dirpaths", () =>
    assertEquals(dir(new URL("file:///foo/bar/")), "/foo"));

  it("works on webpaths", () =>
    assertEquals(dir(new URL("https://deno.land/x/")), "/"));
});

describe("w/ ImportMeta input", () => {
  let __dirname = new URL(".", import.meta.url).pathname.slice(0, -1);
  if (Deno.build.os === "windows") {
    __dirname = __dirname.slice(1).replace(/\//g, "\\");
  }

  it("works on this file", () => assertEquals(dir(import.meta), __dirname));
});
