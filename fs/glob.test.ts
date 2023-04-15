import { resolve } from "../deps/path.ts";
import { assertEquals, describe, it } from "../deps/testing.ts";
import { glob } from "./glob.ts";
import { ROOT_DIR } from "../constants.ts";

const GLOB = resolve(ROOT_DIR, "fixture", "**", "*.ts");

const A_DIR = resolve(ROOT_DIR, "fixture", "a");
const C_DIR = resolve(A_DIR, "b", "c");

const A_FILE = resolve(A_DIR, "findme.ts");
const C_FILE = resolve(C_DIR, "findme.ts");

describe("fs.glob", () =>
  it("finds files matching the pattern", async () =>
    assertEquals(await glob(GLOB), [A_FILE, C_FILE])));
