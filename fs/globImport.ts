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

export type FileHandler = ImportFactory | {
  [Extension: string]: ImportFactory;
};

export type GlobImportOptions = {
  /**
   * When true, import functions will be called and the results will be
   * returned.
   */
  eager?: boolean;
  /**
   * When provided alongside an object `FileHandler`, if a file extension is
   * not found in the object, this fallback will be used rather than throwing.
   */
  fallbackHandler?: ImportFactory;
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
  fileHandler: FileHandler,
  options?: { eager?: false },
): Promise<ImportMap>;
export async function globImport(
  globPattern: string,
  fileHandler: FileHandler,
  options: { eager: true },
): Promise<EagerImportMap>;
export async function globImport(
  globPattern: string,
  fileHandler: FileHandler,
  options: GlobImportOptions,
): Promise<ImportMap | EagerImportMap>;
export async function globImport(
  globPattern: string,
  fileHandler: FileHandler,
  options: GlobImportOptions = {},
) {
  const { eager = false, fallbackHandler } = options;
  const filePaths = await glob(globPattern);

  function _getHandler(extension: string): ImportFactory {
    if (typeof fileHandler === "function") return fileHandler;

    if (extension in fileHandler) return fileHandler[extension];

    if (fallbackHandler) return fallbackHandler;

    const extensions = Object.keys(fileHandler);

    throw new Error(
      "Could not find a file handler for the following extension, and no fallback handler was registered.\n" +
        `extension found: ${extension}\n` +
        `registered extensions: ${JSON.stringify(extensions)}`,
    );
  }

  const entries = await Promise.all(
    filePaths.map(async (filePath) => {
      const extension = extname(filePath);

      const handler = _getHandler(extension);

      const importFunction = handler(filePath);

      return [filePath, eager ? await importFunction() : importFunction];
    }),
  );

  return Object.fromEntries(entries);
}
