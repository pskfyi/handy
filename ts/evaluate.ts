import { cmd, CmdOptions, CmdResult } from "../cli/cmd.ts";
import type { Pretty } from "./types.ts";

export type EvaluateTypeScriptOptions = Pretty<
  & Pick<CmdOptions, "cwd" | "env">
  & { typeCheck?: boolean }
>;

/** Evaluates TypeScript code using `deno eval`, returning the full `CmdResult`.
 * Type checking is enabled by default. */
export async function evaluate(
  code: string,
  opts?: EvaluateTypeScriptOptions,
): Promise<CmdResult> {
  const { typeCheck = true, cwd, env } = opts ?? {};

  const command = typeCheck
    ? ["deno", "eval", "-q", "--check", "--ext=ts", code]
    : ["deno", "eval", "-q", "--ext=ts", code];

  return await cmd(command, { cwd, env, fullResult: true });
}
