import { Stub, stub } from "../_deps/testing.ts";
import { cmd, CmdOptions, CmdResult } from "./cmd.ts";

export type CmdStub = Stub<{ cmd: typeof cmd }>;

const DEFAULT_VALUE = { stdout: "", stderr: "", success: true, code: 0 };

export function stubCmd(
  internalsObj: { cmd: typeof cmd },
  stubFunction: (
    command: string | string[],
    opts: CmdOptions,
  ) => string | Partial<CmdResult> | Promise<string | Partial<CmdResult>> =
    () => Promise.resolve(DEFAULT_VALUE),
): CmdStub {
  return stub(internalsObj, "cmd", async (command, opts = {}) => {
    const result = await stubFunction(command, opts);

    return typeof result === "string"
      ? result
      : { ...DEFAULT_VALUE, ...result };
  });
}
