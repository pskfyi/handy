import { walk } from "@std/fs/walk";
import { relative } from "@std/path/relative";
import { dirname } from "@std/path/dirname";

/** @module
 *
 * Determines a sane default exports object from a directory of TS files in
 * the style of the Deno standard library. */

function _posix(path: string) {
  return path.replace(/\\/g, "/");
}

function _exportsKey(relativePath: string, moduleFilename: string) {
  if (relativePath === moduleFilename) return ".";

  if (relativePath.endsWith(moduleFilename)) {
    return `./${_posix(dirname(relativePath))}`;
  }

  return `./${relativePath.replace(/\.ts$/, "")}`;
}

export type DetermineOptions = {
  /** @default [/\.ts$/] */
  include?: RegExp[];
  /** Note: Exclude patterns only match against the relative path to the file.
   *
   * @default [/\/\./, /\/_/, /\.test\.ts$/] */
  exclude?: RegExp[];
  /** @default "mod.ts" */
  moduleFilename?: string;
  /** @default dir */
  relativeTo?: string;
};

/** Determines a sane default exports object from a directory of TS files in
 * the style of the Deno standard library.
 *
 * @example
 *
 * Directory:
 *
 * ```txt
 *  |- mod.ts
 *  |- utils.ts
 *  |- subdir
 *     |- mod.ts
 *     |- utils.ts
 * ```
 *
 * Code:
 *
 * ```ts
 * import { determine } from "@psk/handy/deno/exports/determine.ts";
 *
 * const exports = await determine("./path/to/dir");
 * // {
 * //   ".": "./mod.ts",
 * //   "./utils": "./utils.ts",
 * //   "./subdir": "./subdir/mod.ts",
 * //   "./subdir/utils": "./subdir/utils.ts",
 * // }
 * ``` */
export async function determine(
  dir: string,
  options: DetermineOptions = {},
): Promise<Record<string, string>> {
  const exports: Record<string, string> = {};
  const {
    include = [/\.ts$/],
    exclude = [/\/\./, /\/_/, /\.test\.ts$/],
    moduleFilename = "mod.ts",
    relativeTo = dir,
  } = options;

  const crawler = walk(
    dir,
    {
      /* Normally the `skip` option could be used, but it matches the entire
      absolute path, while we only want to match against the relative path.

      skip: exclude */
      match: include,
      includeDirs: true,
    },
  );

  const filepaths: {
    key: string;
    value: string;
  }[] = [];

  for await (const { path: absolutePath } of crawler) {
    const relativeKey = _posix(relative(dir, absolutePath));
    const value = `./${_posix(relative(relativeTo, absolutePath))}`;

    if (exclude.some((pattern) => pattern.test(value))) continue;

    filepaths.push({
      key: _exportsKey(relativeKey, moduleFilename),
      value,
    });
  }

  filepaths
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ key, value }) => {
      exports[key] = value;
    });

  return exports;
}
