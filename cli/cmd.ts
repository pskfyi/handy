export type CmdOptions = {
  cwd?: string;
  env?: Record<string, string>;
  fullResult?: boolean;
};

export type CmdResult = {
  stdout: string;
  stderr: string;
  success: boolean;
  exitCode: number;
};

export class CmdError extends Error {
  readonly success = false;

  constructor(
    public readonly command: string | string[],
    public readonly stdout: string,
    public readonly stderr: string,
    public readonly exitCode: number,
  ) {
    super(stderr);
  }
}

/** Run a CLI command and return stdout. */
export async function cmd(
  command: string | string[],
  options?: CmdOptions & { fullResult?: false },
): Promise<string>;
/** Run a CLI command and return stdout, stderr, and exit code. */
export async function cmd(
  command: string | string[],
  options?: CmdOptions & { fullResult: true },
): Promise<CmdResult>;
export async function cmd(
  command: string | string[],
  options?: CmdOptions,
): Promise<string | CmdResult>;
export async function cmd(
  command: string | string[],
  { cwd, env, fullResult = false }: CmdOptions = {},
): Promise<string | CmdResult> {
  const [cmd, ...args] = Array.isArray(command) ? command : command.split(" ");

  const res = await new Deno.Command(cmd, { args, cwd, env }).output();

  const { code: exitCode, success } = res;

  const textDecoder = new TextDecoder();
  const stdout = textDecoder.decode(res.stdout).trim();
  const stderr = textDecoder.decode(res.stderr).trim();

  if (!success) throw new CmdError(command, "", stderr, exitCode);

  return fullResult ? { stdout, stderr, success, exitCode } : stdout;
}
