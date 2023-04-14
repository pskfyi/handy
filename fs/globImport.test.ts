import { resolve } from "../deps/path.ts";
import { assert, assertEquals, describe, it } from "../deps/testing.ts";
import { globImport } from "./globImport.ts";
import { ROOT_DIR } from "../constants.ts";

const globPattern = resolve(ROOT_DIR, "fixture", "**", "*.ts");

const A_DIR = resolve(ROOT_DIR, "fixture", "a");
const C_DIR = resolve(A_DIR, "b", "c");

const A_MD = resolve(A_DIR, "findme.md");
const C_MD = resolve(C_DIR, "findme.md");

const A_TS = resolve(A_DIR, "findme.ts");
const C_TS = resolve(C_DIR, "findme.ts");

const fileHandler = (filePath: string) => () => import(filePath);

describe("fs.globImport", () => {
  it("finds files that match the glob pattern", async () =>
    assertEquals(Object.keys(await globImport(globPattern)), [A_TS, C_TS]));

  it("is lazy by default, not calling its import functions", async () =>
    assert(
      Object.values(await globImport(globPattern))
        .every((val) => typeof val === "function"),
    ));

  it("options.eager causes all imports to be resolved", async () =>
    assertEquals(
      await globImport(globPattern, { eager: true, fileHandler }),
      {
        [A_TS]: { name: "A" },
        [C_TS]: { name: "C" },
      },
    ));

  it("accepts a map from extensions to specific handlers", async () =>
    assertEquals(
      await globImport(
        resolve(ROOT_DIR, "fixture", "**", "*.*"),
        {
          eager: true,
          fileHandler: {
            ".md": (filePath: string) => () => Deno.readTextFile(filePath),
            ".ts": fileHandler,
          },
        },
      ),
      {
        [A_MD]: "A\n",
        [A_TS]: { name: "A" },
        [C_MD]: "C\n",
        [C_TS]: { name: "C" },
      },
    ));
});
