import { resolve } from "../deps/path.ts";
import { assert, assertEquals, describe, it } from "../deps/testing.ts";
import { globImport } from "./globImport.ts";
import { ROOT_DIR } from "../constants.ts";

const globPattern = resolve(ROOT_DIR, "fixture", "**", "*.ts");

const A_DIR = resolve(ROOT_DIR, "fixture", "a");
const C_DIR = resolve(A_DIR, "b", "c");

const A_TS = resolve(A_DIR, "findme.ts");
const C_TS = resolve(C_DIR, "findme.ts");

const stubFileHandler = () => async () => await 1;

const importHandler = (filePath: string) => () => import(filePath);

describe("fs.globImport", () => {
  it(
    "finds files that match the glob pattern",
    async () => {
      const modules = await globImport(globPattern, stubFileHandler);

      assertEquals(Object.keys(modules), [A_TS, C_TS]);
    },
  );

  it(
    "is lazy by default, not calling its import functions",
    async () => {
      const modules = await globImport(globPattern, stubFileHandler);

      assert(
        Object.values(modules).every((val) => typeof val === "function"),
      );
    },
  );

  it(
    "options.eager causes all imports to be resolved",
    async () => {
      const modules = await globImport(
        globPattern,
        importHandler,
        { eager: true },
      );

      assertEquals(
        modules,
        {
          [A_TS]: { name: "A" },
          [C_TS]: { name: "C" },
        },
      );
    },
  );

  it(
    "fileHandler accepts a map from extensions to specific handlers",
    async () => {
      const globPattern = resolve(ROOT_DIR, "fixture", "**", "*.*");

      const modules = await globImport(
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
        modules,
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
