import { _internals } from "../../_test/_internals.ts";

/** Get the full SHA hash of a revision.
 *
 * @example
 * await sha("HEAD");
 * await sha("main");
 * await sha("v1.0.0");
 * await sha("abc1234"); */
export async function sha(
  rev: string,
  { cwd }: { cwd?: string } = {},
): Promise<string> {
  if (/ |\.\./.test(rev)) throw new Error(`More than one revision: ${rev}`);

  try {
    return await _internals.cmd(`git rev-parse ${rev}`, { cwd });
  } catch (error) {
    throw new Error(`Revision not found: ${rev}`, { cause: error });
  }
}
