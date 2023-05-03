import { dirname, fromFileUrl, resolve } from "./_deps/path.ts";

export const ROOT_DIR = dirname(fromFileUrl(import.meta.url)); //without leading "\\"   on Windows

export const FIXTURE_DIR = resolve(ROOT_DIR, "_test", "fixture"); // join prevents double "C:\" on Windows
