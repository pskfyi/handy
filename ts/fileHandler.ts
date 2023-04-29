import {
  Evaluable,
  FileHandler,
  FileHandlerMethodOptions,
  PlainTextFileHandler,
} from "../fs/fileHandler.ts";
import { evaluate } from "./evaluate.ts";

/** Type checking is enabled by default. */
export class TypeScriptFileHandler extends PlainTextFileHandler<".ts">
  implements FileHandler, Evaluable {
  public readonly typeCheck: boolean;

  constructor(opts?: { typeCheck: boolean }) {
    super([".ts"]);

    const { typeCheck = true } = opts ?? {};

    this.typeCheck = typeCheck;
  }

  async evaluate(
    filePath: string,
    opts?: FileHandlerMethodOptions,
  ) {
    const code = await this.read(filePath, opts);

    return await evaluate(code, { typeCheck: this.typeCheck });
  }
}
