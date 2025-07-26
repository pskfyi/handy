import { resolve } from "@std/path";
import { dir } from "../path/dir.ts";

export const FIXTURE_DIR = resolve(dir(import.meta), "fixture");
