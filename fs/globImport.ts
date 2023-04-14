import { glob } from "./glob.ts";

/** A map from absolute filepaths to `import()` functions. */
// deno-lint-ignore no-explicit-any
export type Modules = Record<string, () => Promise<any>>;

/** A map from absolute filepaths to `import()` results. */
// deno-lint-ignore no-explicit-any
export type EagerModules = Record<string, any>;

/** Given a full `filePath`, return an import function. */
// deno-lint-ignore no-explicit-any
export type ImportFactory = (filePath: string) => () => Promise<any>;

export type FileHandler = ImportFactory | {
  [Extension: string]: ImportFactory;
};

export class FileHandlerError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly handlers: Record<string, ImportFactory>,
  ) {
    super(
      "Could not find a file handler for the following file:" +
        `  filePath: ${filePath}\n` +
        `  registered extensions: ${JSON.stringify(Object.keys(handlers))}`,
    );
    this.name = "FileHandlerError";
  }
}

export const DEFAULT_FILE_HANDLER: FileHandler = {
  ".ts": (filePath) => () => import(filePath),
};

export type GlobImportOptions = {
  /** Return file contents rather than import functions. */
  eager?: boolean;
  /**
   * A function that turns a file path into an import function, or an object
   * mapping file extensions to such functions. When a file is found, it will
   * match against the first entry that matches it. Use an empty string as an
   * extension for a fallback handler.
   *
   * @default
   * { ".ts", (filePath) => () => import(filePath) }
   *
   * @example
   * const fileHandler = (filePath) => () => Deno.readTextFile(filePath);
   *
   * @example
   * const fileHandlers = {
   *   ".ts": (filePath) => () => import(filePath),
   *   ".json": (path) => () => Deno.readTextFile(path).then(JSON.parse),
   *   "": (filePath) => () => Deno.readTextFile(filePath), // fallback
   * }
   */
  fileHandler?: FileHandler;
};

function makeImportFunction(
  filePath: string,
  handlers: Record<string, ImportFactory>,
) {
  for (const [extension, handler] of Object.entries(handlers)) {
    if (filePath.endsWith(extension)) return handler(filePath);
  }

  throw new FileHandlerError(filePath, handlers);
}

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
 *
 * @example
 * const pattern = path.resolve(".", "**", "*.ts")
 * const modules = await globImport(pattern)
 *
 * for (const [filePath, importFn] of Object.entries(modules)) {
 *    console.log(`Importing ${filePath}...`)
 *    const module = await importFn()
 * }
 *
 * @example
 * const pattern = path.resolve(".", "**", "*.json")
 * const eager = true // will call each import function
 * const fileHandler = (filePath) =>
 *     () => Deno.readTextFile(filePath).then(JSON.parse)
 *
 * const jsonData = await globImport(pattern, { eager, fileHandler })
 * console.log(jsonData.someFile.someKey[0].someOtherKey...)
 *
 * @example
 * const pattern = path.resolve(".", "**", "*.*")
 * const fileHandler = {
 *   ".ts": (filePath) => () => import(filePath),
 *   "": (filePath) => () => Deno.readTextFile(filePath), // fallback
 * }
 *
 * const modules = await globImport(pattern, { fileHandler })
 */
export async function globImport(
  globPattern: string,
  options?: { eager?: false; fileHandler?: FileHandler },
): Promise<Modules>;
export async function globImport(
  globPattern: string,
  options: { eager: true; fileHandler?: FileHandler },
): Promise<EagerModules>;
export async function globImport(
  globPattern: string,
  options: GlobImportOptions = {},
) {
  const { eager = false, fileHandler = DEFAULT_FILE_HANDLER } = options;
  const filePaths = await glob(globPattern);

  const entries = await Promise.all(
    filePaths.map(async (filePath) => {
      const importFunction = typeof fileHandler === "function"
        ? fileHandler(filePath)
        : makeImportFunction(filePath, fileHandler);

      return [filePath, eager ? await importFunction() : importFunction];
    }),
  );

  return Object.fromEntries(entries);
}
