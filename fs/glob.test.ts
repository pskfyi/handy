import { resolve } from "https://deno.land/std@0.167.0/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { glob } from "./glob.ts";
import { ROOT_DIR } from "../constants.ts";

const GLOB = resolve(ROOT_DIR, "fixture", "**", "*.ts");

const A_DIR = resolve(ROOT_DIR, "fixture", "a");
const C_DIR = resolve(A_DIR, "b", "c");

const A_FILE = resolve(A_DIR, "findme.ts");
const C_FILE = resolve(C_DIR, "findme.ts");

Deno.test("fs.glob", async (t) => {
  await t.step(
    "finds files that match the glob pattern",
    async () => {
      const filePaths = await glob(GLOB);

      assertEquals(
        filePaths,
        [A_FILE, C_FILE],
      );
    },
  );
});
