import { resolve } from "https://deno.land/std@0.167.0/path/mod.ts";
import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { ROOT_DIR } from "../constants.ts";
import { findNearestFile } from "./findNearestFile.ts";

const A_DIR = resolve(ROOT_DIR, "fixture", "a");
const B_DIR = resolve(A_DIR, "b");
const C_DIR = resolve(B_DIR, "c");

Deno.test("fs.findNearestFile", async (t) => {
  await t.step(
    "rejects a filepath; dirpath is expected",
    async () => {
      await assertRejects(
        () => findNearestFile(resolve(A_DIR, "findme.md"), ""),
      );
    },
  );

  await t.step("locates nearest file of a given name", async () => {
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

  await t.step("", async () => {
    assertEquals(
      await findNearestFile(ROOT_DIR, "findme.md"),
      undefined,
    );
  });
});
