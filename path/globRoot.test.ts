import { resolve } from "../deps/path.ts";
import { assertEquals, describe, it } from "../deps/testing.ts";
import { globRoot } from "./globRoot.ts";

const PROJECT_ROOT_DIR = resolve(".");

describe("path.globRoot", () => {
  it(
    "finds the root of an absolute glob pattern",
    () => {
      assertEquals(
        globRoot(resolve(".")),
        PROJECT_ROOT_DIR,
      );
    },
  );

  it(
    "finds the root of a relative glob pattern",
    () => {
      assertEquals(
        globRoot("foo/**/*.ts"),
        "foo/",
      );
    },
  );

  it(
    "returns a non-glob path as-is",
    () => {
      assertEquals(
        globRoot(PROJECT_ROOT_DIR),
        PROJECT_ROOT_DIR,
      );
    },
  );
});
