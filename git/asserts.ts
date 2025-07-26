import { cmd } from "../cli/cmd.ts";

/** Assert that there are no modified changes in the git repository. If a path
 * is provided, it will check that specific file or directory. */
export async function assertUnmodified(filepath?: string) {
  const command = ["git", "diff", "--exit-code", "--quiet"];

  if (filepath) command.push(filepath);

  await cmd(command);
}
