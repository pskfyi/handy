import {
  dirname,
  fromFileUrl,
  posixDirname,
  windowsDirname,
} from "../_deps/path.ts";

/** Returns the directory name of a path. Handles `ImportMeta` properly on
 * Windows, and handles strings in a cross-platform manner.
 *
 * @example
 * console.log(dir(import.meta)); // within /Path/to/file.ext
 * //=> "/Path/to"
 *
 * console.log(dir(import.meta)); // within C:\Path\to\file.ext
 * //=> "C:\Path\to"
 *
 * console.log(new URL("https://deno.land/x/").pathname);
 * //=> "/"
 *
 * console.log(dir("C:\\Path\\to\\file.ext")); // even on POSIX
 * //=> "C:\\Path\\to" */
export function dir(input: ImportMeta | URL | string): string {
  if (typeof input === "string") {
    return input.includes("\\") ? windowsDirname(input) : posixDirname(input);
  } else if (input instanceof URL) {
    return dirname(input.pathname);
  } else {
    return dirname(fromFileUrl(input.url));
  }
}
