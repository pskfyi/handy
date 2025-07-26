import { resolve } from "@std/path";
import { assertArrayIncludes } from "@std/assert";
import { it } from "@std/testing/bdd";
import { glob } from "./glob.ts";
import { FIXTURE_DIR } from "../_test/constants.ts";

const GLOB = resolve(FIXTURE_DIR, "fs", "**", "*.ts");

const A_DIR = resolve(FIXTURE_DIR, "fs", "a");
const C_DIR = resolve(A_DIR, "b", "c");

const A_FILE = resolve(A_DIR, "findme.ts");
const C_FILE = resolve(C_DIR, "findme.ts");

it("finds files matching the pattern", async () =>
  assertArrayIncludes(await glob(GLOB), [A_FILE, C_FILE]));
