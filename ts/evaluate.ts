import { cmd, CmdOptions } from "../cli/cmd.ts";

export type EvaluateTypeScriptOptions = Pick<CmdOptions, "cwd" | "env"> & {
  typeCheck?: boolean;
};

/** Evaluates TypeScript code using `deno eval`, returning the full `CmdResult`.
 * Type checking is enabled by default. */
export async function evaluate(code: string, opts?: EvaluateTypeScriptOptions) {
  const { typeCheck = true, cwd, env } = opts ?? {};

  const command = typeCheck
    ? ["deno", "eval", "-q", "--check", "--ext=ts", code]
    : ["deno", "eval", "-q", "--ext=ts", code];

  return await cmd(command, { cwd, env, fullResult: true });
}
