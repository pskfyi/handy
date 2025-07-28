import { globToRegExp } from "@std/path";
import { walk } from "@std/fs/walk";
import { globRoot } from "../path/globRoot.ts";

/**
 * @module
 *
 * Util for finding files matching a glob pattern. */

/** Find all filepaths matching a glob pattern. Expects an absolute or
 * relative pattern rather than separate base path.
 *
 * @example
 * import path from "https://deno.land/std/path/mod.ts";
 *
 * const pattern = path.resolve(".", "**", "*.ts")
 *
 * await glob(pattern) // finds all ts files within "." */
export async function glob(globPattern: string): Promise<string[]> {
  const root = globRoot(globPattern);

  const filePaths: string[] = [];

  const crawler = walk(
    root,
    {
      match: [globToRegExp(globPattern, { globstar: true })],
      includeDirs: false,
    },
  );

  for await (const { path: filePath } of crawler) {
    filePaths.push(filePath);
  }

  return filePaths;
}
