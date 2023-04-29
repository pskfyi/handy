export type FileHandler = {
  read: (filePath: string) => unknown | Promise<unknown>;

  // deno-lint-ignore no-explicit-any
  write: (filePath: string, data: any) => Promise<void>;
};

/** A helper class for handling files by extensions. */
export abstract class FileExtensionHandler<Ext extends string = string> {
  extensions: Ext[];

  constructor(extensions?: Ext[]) {
    this.extensions = extensions ?? [];
  }

  /** @returns `true` if the file path ends with one of the extensions. */
  validateExtension(filePath: string): filePath is `${string}${Ext}` {
    if (!this.extensions.length) return true;

    return this.extensions.some((ext) => filePath.endsWith(ext));
  }

  /** @throws {InvalidExtensionError} if the file path does not end with one of the extensions. */
  assertValidExtension(
    filePath: string,
  ): asserts filePath is `${string}${Ext}` {
    if (!this.validateExtension(filePath)) {
      throw new InvalidExtensionError(filePath, this.extensions);
    }
  }
}

export type Evaluable = {
  evaluate: (filePath: string) => unknown | Promise<unknown>;
};

export class InvalidExtensionError extends TypeError {
  constructor(filePath: string, extensions: string[]) {
    const extensionsString = extensions
      .map((e) => JSON.stringify(e))
      .join(", ");

    super(
      "File path does not end with one of the extensions:\n" +
        `  path: ${filePath}\n` +
        `  extensions: ${extensionsString}`,
    );
    this.name = "InvalidExtensionError";
  }
}

export type FileHandlerMethodOptions = {
  /** If `true`, the method will not validate the file extension. */
  force?: boolean;
};

/** A sample implementation with `FileHandler` and `FileExtensionHandler` which
 * can serve as a base class for handlers of UTF8-encoded files.
 *
 * @example
 * const handler = new PlainTextFileHandler();
 *
 * await handler.read("./license"); // "BSD Zero Clause License ..."
 * await handler.write("./readme.md", "# Hello, world!");
 *
 * @example
 * const handler = new PlainTextFileHandler([".txt"]);
 *
 * handler.validateExtension("foo.txt"); // true
 * handler.validateExtension("foo.md"); // false
 * await handler.read("./readme.md"); // throws InvalidExtensionError
 *
 * @example
 * // TypeScript constraint: you must use `:` to explicitly specify
 * // the type for assertions to work
 * const handler: PlainTextFileHandler<".md"> = new PlainTextFileHandler([".md"]);
 *
 * handler.assertValidExtension("foo.txt"); // throws InvalidExtensionError
 *
 * @example
 * import { cmd } from "../cli/utils.ts";
 *
 * class TypeScriptFileHandler extends PlainTextFileHandler<"ts">
 *   implements FileHandler, Evaluable {
 *   constructor() {
 *     super([".ts"]);
 *   }
 *
 *   async evaluate(filePath: string) {
 *     const code = await this.read(filePath);
 *
 *     return await cmd(
 *       ["deno", "eval", "-q", "--check", "--ext=ts", code]
 *     );
 *   }
 * } */
export class PlainTextFileHandler<Ext extends string = string>
  extends FileExtensionHandler<Ext>
  implements FileHandler {
  constructor(extensions?: Ext[]) {
    super(extensions);
  }

  async read(filePath: string, opts?: FileHandlerMethodOptions) {
    opts?.force || this.assertValidExtension(filePath);

    return await Deno.readTextFile(filePath);
  }

  async write(filePath: string, data: string, opts?: FileHandlerMethodOptions) {
    opts?.force || this.assertValidExtension(filePath);

    await Deno.writeTextFile(filePath, data);
  }
}
