import { fromFileUrl, resolve, toFileUrl } from "../_deps/path.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertRejects,
  describe,
  it,
} from "../_deps/testing.ts";
import { FileHandlerError, globImport } from "./globImport.ts";
import { FIXTURE_DIR } from "../_constants.ts";
import { posixNewlines } from "../os/newlines.ts";

const globPattern = resolve(FIXTURE_DIR, "fs", "**", "*.ts");

const A_DIR = resolve(FIXTURE_DIR, "fs", "a");
const C_DIR = resolve(A_DIR, "b", "c");

const A_MD = toFileUrl(resolve(A_DIR, "findme.md")).href;
const C_MD = toFileUrl(resolve(C_DIR, "findme.md")).href;

const A_TS = toFileUrl(resolve(A_DIR, "findme.ts")).href;
const C_TS = toFileUrl(resolve(C_DIR, "findme.ts")).href;

const fileHandler = (filePath: string) => () => import(filePath);

describe("fs.globImport", () => {
  it("finds files matching the pattern", async () =>
    assertArrayIncludes(
      Object.keys(await globImport(globPattern)),
      [A_TS, C_TS],
    ));

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
        resolve(A_DIR, "**", "*.*"),
        {
          eager: true,
          fileHandler: {
            ".md": (filePath: string) => async () =>
              posixNewlines(await Deno.readTextFile(fromFileUrl(filePath))),
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
