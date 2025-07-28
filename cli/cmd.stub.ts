/** @module
 *
 * A sophisticated stub for the `cmd` util. */

import { type Stub, stub } from "@std/testing/mock";
import type { cmd, CmdOptions, CmdResult, Command } from "./cmd.ts";

/** A stub for the `cmd` util. */
export type CmdStub = Stub<{ cmd: typeof cmd }>;

const DEFAULT_VALUE = { stdout: "", stderr: "", success: true, code: 0 };

/** Create a stub for the `cmd` util. */
export function stubCmd(
  internalsObj: { cmd: typeof cmd },
  stubFunction: (
    command: Command,
    opts: CmdOptions,
  ) => string | Partial<CmdResult> | Promise<string | Partial<CmdResult>> =
    () => Promise.resolve(DEFAULT_VALUE),
): CmdStub {
  return stub(
    internalsObj,
    "cmd",
    (async (command, opts = {}) => {
      const result = await stubFunction(command, opts);

      return typeof result === "string"
        ? result
        : { ...DEFAULT_VALUE, ...result };
    }) as typeof cmd,
  );
}
