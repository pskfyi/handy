import { FileExtensionHandler, FileHandler } from "../fs/fileHandler.ts";
import { JsonValue } from "./types.ts";

export type JsonReadOptions<ReviverResult = JsonValue> = {
  // deno-lint-ignore no-explicit-any
  reviver?: ((this: any, key: string, value: any) => ReviverResult) | undefined;
};

// deno-lint-ignore no-explicit-any
export type JsonWriteOptions<ReplacerResult = any> = {
  // deno-lint-ignore no-explicit-any
  replacer?: (this: any, key: string, value: any) => ReplacerResult;
  space?: string | number;
};

/**
 * @example
 * const handler = new JsonFileHandler();
 *
 * await handler.write("foo.json", { foo: "bar" });
 * // foo.json: '{\n  "foo":"bar"\n}' (2 space indent by default)
 *
 * await handler.read("foo.json"); // { foo: "bar" }
 * await handler.read("foo.yaml"); // throws InvalidExtensionError
 *
 * @example
 * const handler = new JsonFileHandler({ write: { space: 0 } });
 * await handler.write("foo.json", { foo: "bar" });
 * // foo.json: '{"foo":"bar"}' (no spaces)
 */
export class JsonFileHandler extends FileExtensionHandler
  implements FileHandler {
  constructor(
    public readonly options: {
      read?: JsonReadOptions;
      write?: JsonWriteOptions;
    } = {},
  ) {
    super([".json"]);
  }

  async read(filePath: string): Promise<JsonValue>;
  async read<T = JsonValue>(
    filePath: string,
    opts?: JsonReadOptions<T>,
  ): Promise<JsonValue>;
  async read(filePath: string, opts?: JsonReadOptions) {
    const { reviver } = opts ?? this.options.read ?? {};

    this.assertValidExtension(filePath);
    const raw = await Deno.readTextFile(filePath);

    return JSON.parse(raw, reviver);
  }

  async write(filePath: string, data: JsonValue): Promise<void>;
  // deno-lint-ignore no-explicit-any
  async write<ReplacerResult = any>(
    filePath: string,
    data: JsonValue,
    opts: JsonWriteOptions<ReplacerResult>,
  ): Promise<void>;
  async write(
    filePath: string,
    data: JsonValue,
    opts: JsonWriteOptions = {},
  ): Promise<void> {
    const { replacer, space = 2 } = opts ?? this.options.write ?? {};

    this.assertValidExtension(filePath);

    await Deno.writeTextFile(filePath, JSON.stringify(data, replacer, space));
  }
}
