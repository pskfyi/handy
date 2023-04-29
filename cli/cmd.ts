export type CmdOptions = {
  cwd?: string;
  env?: Record<string, string>;
  fullResult?: boolean;
};

export type CmdResult = Pick<Deno.CommandOutput, "code" | "success"> & {
  stdout: string;
  stderr: string;
};

export class CmdError extends Error implements CmdResult {
  readonly success = false;

  constructor(
    public readonly command: string | string[],
    public readonly stdout: string,
    public readonly stderr: string,
    public readonly code: number,
  ) {
    super(stderr);
  }
}

/** Run a CLI command and return stdout.
 *
 * @throws {CmdError} if the command fails.
 *
 * @example
 * await cmd("deno --version"); // "deno 1.33.1" (or whatever) */
export async function cmd(
  command: string | string[],
  options?: CmdOptions & { fullResult?: false },
): Promise<string>;
/**
 * @example
 * await cmd("deno --version", { fullResult: true });
 * // { stdout: "deno 1.33.1", stderr: "", success: true, exitCode: 0 }
 *
 * @example
 * await cmd("deno LMAO", { fullResult: true });
 * // { stdout: "", stderr: "error: ...", success: false, exitCode: 1 } */
export async function cmd(
  command: string | string[],
  options: CmdOptions & { fullResult: true },
): Promise<CmdResult>;
export async function cmd(
  command: string | string[],
  options?: CmdOptions,
): Promise<string | CmdResult>;
export async function cmd(
  command: string | string[],
  { cwd, env, fullResult = false }: CmdOptions = {},
) {
  const [cmd, ...args] = Array.isArray(command) ? command : command.split(" ");

  const res = await new Deno.Command(cmd, { args, cwd, env }).output();

  const { code, success } = res;

  const textDecoder = new TextDecoder();
  const stdout = textDecoder.decode(res.stdout).trim();
  const stderr = textDecoder.decode(res.stderr).trim();

  if (fullResult) return { stdout, stderr, success, code };
  else if (!success) throw new CmdError(command, "", stderr, code);
  else return stdout;
}
