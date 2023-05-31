import { fromFileUrl, resolve, toFileUrl } from "../_deps/path.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertRejects,
  test,
} from "../_deps/testing.ts";
import { FileHandlerError, globImport } from "./globImport.ts";
import { FIXTURE_DIR } from "../_test/constants.ts";
import { posixNewlines } from "../os/newlines.ts";

const globPattern = resolve(FIXTURE_DIR, "fs", "**", "*.ts");

const A_DIR = resolve(FIXTURE_DIR, "fs", "a");
const C_DIR = resolve(A_DIR, "b", "c");

const A_MD = toFileUrl(resolve(A_DIR, "findme.md")).href;
const C_MD = toFileUrl(resolve(C_DIR, "findme.md")).href;

const A_TS = toFileUrl(resolve(A_DIR, "findme.ts")).href;
const C_TS = toFileUrl(resolve(C_DIR, "findme.ts")).href;

const fileHandler = (filePath: string) => () => import(filePath);

test("locating files", async () =>
  assertArrayIncludes(
    Object.keys(await globImport(globPattern)),
    [A_TS, C_TS],
  ));

test("defaults", async () =>
  assert(
    Object.values(await globImport(globPattern))
      .every((val) => typeof val === "function"),
  ));

test("can resolve imports", async () =>
  assertEquals(
    await globImport(globPattern, { eager: true, fileHandler }),
    {
      [A_TS]: { name: "A" },
      [C_TS]: { name: "C" },
    },
  ));

test("file extension handling", async () =>
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

test("unregistered extensions", async () => {
  const pattern = resolve(FIXTURE_DIR, "**", "*.*");

  await assertRejects(
    () => globImport(pattern, { eager: true, fileHandler: {} }),
    FileHandlerError,
  );
});
