import { resolve } from "../_deps/path.ts";
import { dir } from "../path/dir.ts";

export const FIXTURE_DIR = resolve(dir(import.meta), "fixture");
