import { resolve } from "../_deps/path.ts";
import { assertArrayIncludes, describe, it } from "../_deps/testing.ts";
import { glob } from "./glob.ts";
import { FIXTURE_DIR } from "../_constants.ts";

const GLOB = resolve(FIXTURE_DIR, "**", "*.ts");

const A_DIR = resolve(FIXTURE_DIR, "a");
const C_DIR = resolve(A_DIR, "b", "c");

const A_FILE = resolve(A_DIR, "findme.ts");
const C_FILE = resolve(C_DIR, "findme.ts");

describe("fs.glob", () =>
  it("finds files matching the pattern", async () =>
    assertArrayIncludes(await glob(GLOB), [A_FILE, C_FILE])));
