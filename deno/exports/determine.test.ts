import { describe, test } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { determine } from "./determine.ts";
import { FIXTURE_DIR } from "../../_test/constants.ts";
import { join } from "@std/path/join";

const DIR = join(FIXTURE_DIR, "deno");

describe("determine", () => {
  test("produces a exports object like the standard library", async () => {
    assertEquals(await determine(DIR), {
      ".": "./mod.ts",
      "./utils": "./utils.ts",
      "./subdir": "./subdir/mod.ts",
      "./subdir/utils": "./subdir/utils.ts",
    });
  });

  test("has configurable excludes", async () => {
    assertEquals(await determine(DIR, { exclude: [/utils/] }), {
      ".": "./mod.ts",
      "./subdir/_skip": "./subdir/_skip.ts",
      "./subdir": "./subdir/mod.ts",
    });
  });

  test("has configurable includes", async () => {
    assertEquals(await determine(DIR, { include: [/\.json$/] }), {
      "./subdir/data.json": "./subdir/data.json",
    });
  });

  test("has configurable relative root", async () => {
    assertEquals(await determine(DIR, { relativeTo: FIXTURE_DIR }), {
      ".": "./deno/mod.ts",
      "./utils": "./deno/utils.ts",
      "./subdir": "./deno/subdir/mod.ts",
      "./subdir/utils": "./deno/subdir/utils.ts",
    });
  });

  test("has configurable module filename", async () => {
    assertEquals(await determine(DIR, { moduleFilename: "utils.ts" }), {
      ".": "./utils.ts",
      "./mod": "./mod.ts",
      "./subdir": "./subdir/utils.ts",
      "./subdir/mod": "./subdir/mod.ts",
    });
  });
});
