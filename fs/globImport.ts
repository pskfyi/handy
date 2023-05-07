import { glob } from "./glob.ts";
import { toFileUrl } from "../_deps/path.ts";

/** A callback that will open a file and return its contents.
 *
 * @example
 * const fn: ImportLike = () => import("./someModule.ts")
 * const module = await fn()
 *
 * @example
 * const fn: ImportLike = () =>
 *   Deno.readTextFile("./someFile.txt")
 * const module = await fn() */
// deno-lint-ignore no-explicit-any
export type ImportLike = () => Promise<any>;

/** A map from absolute filepaths to `import()`-like functions which, when
 * called, return the associated file's contents. */
export type Modules = Record<string, ImportLike>;

/** A map from absolute filepaths to the contents of those files. */
// deno-lint-ignore no-explicit-any
export type EagerModules = Record<string, any>;

/** Given a full `filePath`, return an `import()`-like function. */
export type ImportFactory = (filePath: string) => ImportLike;

export type FileHandler = ImportFactory | {
  [Extension: string]: ImportFactory;
};

export class FileHandlerError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly handlers: Record<string, unknown>,
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
  /** A function that turns a file path into an import function, or an object
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
   * const fileHandler = {
   *   ".ts": (filePath) => () => import(filePath),
   *   ".json": (path) => () =>
   *     Deno.readTextFile(path).then(JSON.parse),
   *   "": (filePath) => () => Deno.readTextFile(filePath), // fallback
   * } */
  fileHandler?: FileHandler;
};

function makeImportFunction(
  filePath: string,
  handlers: Record<string, ImportFactory>,
): ImportLike {
  for (const [extension, handler] of Object.entries(handlers)) {
    if (filePath.endsWith(extension)) return handler(filePath);
  }

  throw new FileHandlerError(filePath, handlers);
}

/** Given a glob pattern, returns a mapping from the identified filepaths to
 * `ImportLike` callback functions which will return the contents of the
 * associated file. Like the `glob` utility, this expects an absolute or
 * relative glob pattern rather than a separate base path.
 *
 * Only handles `.ts` files by default. Optionally you can pass a `FileHandler`
 * describing how to open file types by extension. See the example below.
 *
 * @example
 * const pattern = path.resolve(".", "**", "*.ts")
 * const modules = await globImport(pattern)
 *
 * for (const [filePath, importLike] of Object.entries(modules)) {
 *    console.log(`Importing ${filePath}...`)
 *    const module = await importLike()
 * }
 *
 * @example
 * const pattern = path.resolve(".", "**", "*.json")
 * const fileHandler = (filePath) =>
 *     () => Deno.readTextFile(filePath).then(JSON.parse)
 *
 * const modules = await globImport(pattern, { fileHandler })
 * for (const [filePath, importLike] of Object.entries(modules)) {
 *   console.log(`Importing ${filePath}...`)
 *   const json = await importLike()
 * }
 *
 * @example
 * const pattern = path.resolve(".", "**", "*.*")
 * const fileHandler = {
 *   ".ts": (filePath) => () => import(filePath),
 *   "": (filePath) => () => Deno.readTextFile(filePath), // fallback
 * }
 *
 * const modules = await globImport(pattern, { fileHandler }) */
export async function globImport(
  globPattern: string,
  options?: { eager?: false; fileHandler?: FileHandler },
): Promise<Modules>;
/** Given a glob pattern, returns a mapping from the identified filepaths to the
 * contents of those files.
 *
 * Optionally you can pass a `FileHandler` describing how to open file types by
 * extension. See the example below.
 *
 * @example
 * const pattern = path.resolve(".", "**", "*.ts")
 * const modules = await globImport(pattern, { eager: true })
 * modules["/path/to/someModule.ts"].someExportedFunction()
 *
 * @example
 * const pattern = path.resolve(".", "**", "*.json")
 * const fileHandler = (filePath) =>
 *     () => Deno.readTextFile(filePath).then(JSON.parse)
 *
 * const data = await globImport(pattern, { eager: true, fileHandler })
 * data["/path/to/someFile.json"].someKey[0].someOtherKey */
export async function globImport(
  globPattern: string,
  options: { eager: true; fileHandler?: FileHandler },
): Promise<EagerModules>;
export async function globImport(
  globPattern: string,
  options: GlobImportOptions = {},
): Promise<Modules | EagerModules> {
  const { eager = false, fileHandler = DEFAULT_FILE_HANDLER } = options;
  const filePaths = await glob(globPattern);

  const entries = await Promise.all(
    filePaths.map(async (filePath) => {
      filePath = toFileUrl(filePath).href;
      const importLike = typeof fileHandler === "function"
        ? fileHandler(filePath)
        : makeImportFunction(filePath, fileHandler);

      return [filePath, eager ? await importLike() : importLike];
    }),
  );

  return Object.fromEntries(entries);
}
