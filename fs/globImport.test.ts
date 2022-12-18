import { resolve } from "https://deno.land/std@0.167.0/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { globImport } from "./globImport.ts";
import { ROOT_DIR } from "../constants.ts";
import { assert } from "https://deno.land/std@0.168.0/_util/asserts.ts";

const globPattern = resolve(ROOT_DIR, "fixture", "**", "*.ts");

const A_DIR = resolve(ROOT_DIR, "fixture", "a");
const C_DIR = resolve(A_DIR, "b", "c");

const A_FILE = resolve(A_DIR, "findme.ts");
const C_FILE = resolve(C_DIR, "findme.ts");

Deno.test("fs.globImport", async (t) => {
  await t.step(
    "finds files that match the glob pattern",
    async () => {
      const importMap = await globImport(globPattern);

      assertEquals(
        Object.keys(importMap),
        [A_FILE, C_FILE],
      );
    },
  );

  await t.step(
    "is lazy by default, not calling its import functions",
    async () => {
      const importMap = await globImport(globPattern);

      assert(
        Object.values(importMap).every((val) => typeof val === "function"),
      );
    },
  );

  await t.step(
    "options.eager causes all imports to be resolved",
    async () => {
      const importMap = await globImport(globPattern, { eager: true });

      assertEquals(
        importMap,
        {
          [A_FILE]: { name: "A" },
          [C_FILE]: { name: "C" },
        },
      );
    },
  );

  await t.step(
    "options.eager causes all imports to be resolved",
    async () => {
      const globPattern = resolve(ROOT_DIR, "fixture", "**", "*.md");

      const options = {
        eager: true,
        fileHandlers: {
          ".md": (filePath: string) => () => Deno.readTextFile(filePath),
        },
      };

      const importMap = await globImport(globPattern, options);

      const A = resolve(A_DIR, "findme.md");
      const C = resolve(C_DIR, "findme.md");

      assertEquals(
        importMap,
        {
          [A]: "A\n",
          [C]: "C\n",
        },
      );
    },
  );
});
