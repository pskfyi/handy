import { resolve } from "./_deps/path.ts";

export const ROOT_DIR = new URL(".", import.meta.url).pathname;
export const FIXTURE_DIR = resolve(ROOT_DIR, "_test", "fixture");
