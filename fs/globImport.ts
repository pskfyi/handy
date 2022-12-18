import { extname } from "https://deno.land/std@0.168.0/path/mod.ts";
import { glob } from "./glob.ts";

/** A map from absolute filepaths to import() functions. */
// deno-lint-ignore no-explicit-any
export type ImportMap = Record<string, () => Promise<any>>;

/** A map from absolute filepaths to import() results. */
// deno-lint-ignore no-explicit-any
export type EagerImportMap = Record<string, any>;

/** Given a full `filePath`, return an import function. */
// deno-lint-ignore no-explicit-any
export type ImportFactory = (filePath: string) => () => Promise<any>;

export type FileHandlers = {
  [Extension: string]: ImportFactory;
};

export const DEFAULT_IMPORT_FACTORY: ImportFactory = (filePath: string) => () =>
  import(filePath);

export type GlobImportOptions = {
  /**
   * When true, import functions will be called and the results will be
   * returned.
   */
  eager?: boolean;
  fileHandlers?: FileHandlers;
};

/**
 * Given a glob pattern, returns a mapping from the identified filepaths to
 * imports. Like the `glob` utility, this expects an absolute or relative glob
 * pattern rather than a separate base path.
 *
 * By default, import functions are returned without being called. When
 * `options.eager` is set to `true`, each import function is called and the
 * *contents* of those files are returned instead.
 *
 * Optionally you can pass a map of `FileHandlers`, which describe how to
 * create an import function for a given file extension. See the example below.
 * When a file is found whose extension is not found among the `FileHandlers`,
 * a regular import function will be created.
 *
 * @example
 * import path from "https://deno.land/std/path/mod.ts";
 *
 * const pattern = path.resolve(".", "**", "*.*")
 *
 * const fileHandlers: FileHandlers = {
 *   ".json": (filePath) =>
 *     () => Deno.readTextFile(filePath).then(JSON.parse)
 * }
 *
 * const importMap = await globImport(pattern, { eager: true, fileHandlers })
 */
export async function globImport(
  globPattern: string,
  options?: { eager?: false; fileHandlers?: FileHandlers },
): Promise<ImportMap>;
export async function globImport(
  globPattern: string,
  options: { eager: true; fileHandlers?: FileHandlers },
): Promise<EagerImportMap>;
export async function globImport(
  globPattern: string,
  options: GlobImportOptions,
): Promise<ImportMap | EagerImportMap>;
export async function globImport(
  globPattern: string,
  options: GlobImportOptions = {},
) {
  const { eager = false, fileHandlers } = options;
  const handlers = { ...fileHandlers };
  const filePaths = await glob(globPattern);

  const entries = await Promise.all(
    filePaths.map(async (filePath) => {
      const ext = extname(filePath);

      if (!(ext in handlers)) handlers[ext] = DEFAULT_IMPORT_FACTORY;

      const fn = handlers[ext](filePath);

      return [filePath, eager ? await fn() : fn];
    }),
  );

  return Object.fromEntries(entries);
}
