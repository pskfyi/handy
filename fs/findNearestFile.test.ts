import { resolve } from "../deps/path.ts";
import { assertEquals, assertRejects, describe, it } from "../deps/testing.ts";
import { ROOT_DIR } from "../constants.ts";
import { findNearestFile } from "./findNearestFile.ts";

const A_DIR = resolve(ROOT_DIR, "fixture", "a");
const B_DIR = resolve(A_DIR, "b");
const C_DIR = resolve(B_DIR, "c");

describe("fs.findNearestFile", () => {
  it("rejects a filepath; dirpath is expected", async () =>
    void await assertRejects(() =>
      findNearestFile(resolve(A_DIR, "findme.md"), "")
    ));

  it("locates nearest file of a given name", async () => {
    assertEquals(
      await findNearestFile(A_DIR, "findme.md"),
      resolve(A_DIR, "findme.md"),
    );
    assertEquals(
      await findNearestFile(B_DIR, "findme.md"),
      resolve(A_DIR, "findme.md"),
    );
    assertEquals(
      await findNearestFile(C_DIR, "findme.md"),
      resolve(C_DIR, "findme.md"),
    );
  });

  it("falls back to undefined", async () =>
    assertEquals(
      await findNearestFile(ROOT_DIR, "findme.md"),
      undefined,
    ));
});
