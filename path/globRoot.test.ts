import { resolve } from "https://deno.land/std@0.167.0/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { globRoot } from "./globRoot.ts";

const PROJECT_ROOT_DIR = resolve(".");

Deno.test("path.globRoot", async (t) => {
  await t.step(
    "finds the root of an absolute glob pattern",
    () => {
      assertEquals(
        globRoot(resolve(".")),
        PROJECT_ROOT_DIR,
      );
    },
  );

  await t.step(
    "finds the root of a relative glob pattern",
    () => {
      assertEquals(
        globRoot("foo/**/*.ts"),
        "foo/",
      );
    },
  );

  await t.step(
    "returns a non-glob path as-is",
    () => {
      assertEquals(
        globRoot(PROJECT_ROOT_DIR),
        PROJECT_ROOT_DIR,
      );
    },
  );
});
