import { cmd, type CmdOptions, type CmdResult } from "../cli/cmd.ts";

export type EvaluateJavaScriptOptions = Pick<CmdOptions, "cwd" | "env">;

/** @module
 *
 * JS utilities. */

/** Evaluates JavaScript code using `deno eval`, returning the full `CmdResult`.
 */
export async function evaluate(
  code: string,
  opts?: EvaluateJavaScriptOptions,
): Promise<CmdResult> {
  const { cwd, env } = opts ?? {};

  const command = ["deno", "eval", "-q", "--ext=js", code];

  return await cmd(command, { cwd, env, fullResult: true });
}
