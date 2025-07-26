import { assertEquals } from "@std/assert";
import { describe, test } from "@std/testing/bdd";
import { dir } from "./dir.ts";

function assertDir(input: string | URL | ImportMeta, expected: string): void {
  assertEquals(dir(input), expected);
}

describe("w/ string input", () => {
  describe("w/ Posix separators", () => {
    test("filepaths", () => assertDir("/foo/*.ts", "/foo"));
    test("dirpaths", () => assertDir("/foo/bar/", "/foo"));
  });

  describe("w/ Windows separators", () => {
    test("filepaths", () => assertDir("\\foo\\*.ts", "\\foo"));
    test("dirpaths", () => assertDir("\\foo\\bar\\", "\\foo"));
  });
});

describe("w/ URL input", () => {
  test("filepaths", () => assertDir(new URL("file:///foo/*.ts"), "/foo"));
  test("dirpaths", () => assertDir(new URL("file:///foo/bar/"), "/foo"));
  test("webpaths", () => assertDir(new URL("https://deno.land/x/"), "/"));
});

describe("w/ ImportMeta input", () => {
  let __dirname = new URL(".", import.meta.url).pathname.slice(0, -1);
  if (Deno.build.os === "windows") {
    __dirname = __dirname.slice(1).replace(/\//g, "\\");
  }

  test("this file", () => assertDir(import.meta, __dirname));
});
