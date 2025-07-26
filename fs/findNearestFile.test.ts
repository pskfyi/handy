import { resolve } from "@std/path";
import { assertEquals, assertRejects } from "@std/assert";
import { test } from "@std/testing/bdd";
import { FIXTURE_DIR } from "../_test/constants.ts";
import { findNearestFile } from "./findNearestFile.ts";

const A_DIR = resolve(FIXTURE_DIR, "fs", "a");
const B_DIR = resolve(A_DIR, "b");
const C_DIR = resolve(B_DIR, "c");

test("rejects a filepath", async () =>
  void await assertRejects(() =>
    findNearestFile(resolve(A_DIR, "findme.md"), "")
  ));

test("locates nearest file", async () => {
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

test("falls back to undefined", async () =>
  assertEquals(
    await findNearestFile(FIXTURE_DIR, "findme.md"),
    undefined,
  ));
