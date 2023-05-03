import { join, resolve, sep } from "../_deps/path.ts";
import { assertEquals, describe, it } from "../_deps/testing.ts";
import { globRoot } from "./globRoot.ts";

const PROJECT_ROOT_DIR = resolve(".");

describe("path.globRoot", () => {
  it("finds root of an absolute glob pattern", () =>
    assertEquals(globRoot(resolve(".")), PROJECT_ROOT_DIR));

  it("finds root of a relative glob pattern", () =>
    assertEquals(globRoot(join("foo", "**", "*.ts")), "foo".concat(sep)));

  it("returns a non-glob path as-is", () =>
    assertEquals(globRoot(PROJECT_ROOT_DIR), PROJECT_ROOT_DIR));
});
