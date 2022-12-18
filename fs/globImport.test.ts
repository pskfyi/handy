import { resolve } from "https://deno.land/std@0.167.0/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { globImport } from "./globImport.ts";
import { ROOT_DIR } from "../constants.ts";
import { assert } from "https://deno.land/std@0.168.0/_util/asserts.ts";

const globPattern = resolve(ROOT_DIR, "fixture", "**", "*.ts");

const A_DIR = resolve(ROOT_DIR, "fixture", "a");
const C_DIR = resolve(A_DIR, "b", "c");

const A_TS = resolve(A_DIR, "findme.ts");
const C_TS = resolve(C_DIR, "findme.ts");

const stubFileHandler = () => async () => await 1;

const importHandler = (filePath: string) => () => import(filePath);

Deno.test("fs.globImport", async (t) => {
  await t.step(
    "finds files that match the glob pattern",
    async () => {
      const importMap = await globImport(
        globPattern,
        stubFileHandler,
      );

      assertEquals(
        Object.keys(importMap),
        [A_TS, C_TS],
      );
    },
  );

  await t.step(
    "is lazy by default, not calling its import functions",
    async () => {
      const importMap = await globImport(globPattern, stubFileHandler);

      assert(
        Object.values(importMap).every((val) => typeof val === "function"),
      );
    },
  );

  await t.step(
    "options.eager causes all imports to be resolved",
    async () => {
      const importMap = await globImport(
        globPattern,
        importHandler,
        { eager: true },
      );

      assertEquals(
        importMap,
        {
          [A_TS]: { name: "A" },
          [C_TS]: { name: "C" },
        },
      );
    },
  );

  await t.step(
    "fileHandler accepts a map from extensions to specific handlers",
    async () => {
      const globPattern = resolve(ROOT_DIR, "fixture", "**", "*.*");

      const importMap = await globImport(
        globPattern,
        {
          ".md": (filePath: string) => () => Deno.readTextFile(filePath),
          ".ts": importHandler,
        },
        { eager: true },
      );

      const A_MD = resolve(A_DIR, "findme.md");
      const C_MD = resolve(C_DIR, "findme.md");

      assertEquals(
        importMap,
        {
          [A_MD]: "A\n",
          [A_TS]: { name: "A" },
          [C_MD]: "C\n",
          [C_TS]: { name: "C" },
        },
      );
    },
  );
});
