import { resolve } from "../deps/path.ts";
import {
  assert,
  assertEquals,
  assertRejects,
  describe,
  it,
} from "../deps/testing.ts";
import { FileHandlerError, globImport } from "./globImport.ts";
import { FIXTURE_DIR } from "../_constants.ts";

const globPattern = resolve(FIXTURE_DIR, "**", "*.ts");

const A_DIR = resolve(FIXTURE_DIR, "a");
const C_DIR = resolve(A_DIR, "b", "c");

const A_MD = resolve(A_DIR, "findme.md");
const C_MD = resolve(C_DIR, "findme.md");

const A_TS = resolve(A_DIR, "findme.ts");
const C_TS = resolve(C_DIR, "findme.ts");

const fileHandler = (filePath: string) => () => import(filePath);

describe("fs.globImport", () => {
  it("finds files matching the pattern", async () =>
    assertEquals(Object.keys(await globImport(globPattern)), [A_TS, C_TS]));

  it("returns import functions by default", async () =>
    assert(
      Object.values(await globImport(globPattern))
        .every((val) => typeof val === "function"),
    ));

  it("can return resolved imports", async () =>
    assertEquals(
      await globImport(globPattern, { eager: true, fileHandler }),
      {
        [A_TS]: { name: "A" },
        [C_TS]: { name: "C" },
      },
    ));

  it("can handle files by extension", async () =>
    assertEquals(
      await globImport(
        resolve(FIXTURE_DIR, "a", "**", "*.*"),
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

  it("throws custom error on unhandled files", async () => {
    const pattern = resolve(FIXTURE_DIR, "**", "*.*");

    await assertRejects(
      () => globImport(pattern, { eager: true, fileHandler: {} }),
      FileHandlerError,
    );
  });
});
