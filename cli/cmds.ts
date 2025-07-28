import { indent } from "../string/indent.ts";
import { cmd, type CmdResult, type Command } from "./cmd.ts";
import { FAILURE, SUCCESS } from "./icons.ts";

/**
 * @module
 *
 * A util for running multiple CLI commands. */

function _summary(result: CmdResult) {
  const icon = result.success ? SUCCESS : FAILURE;

  console.log(`${icon} ${JSON.stringify(result.command)}`);

  return result;
}

/** Executes multiple commands simultaneously. Provides a short summary as each
 * command completes, then provides detailed output for failures. */
export async function cmds(
  commands: Command[],
) {
  const results = await Promise.all(
    commands.map((c) =>
      cmd(c, { fullResult: true }).then((result) => _summary(result))
    ),
  );

  for (const { code, command, success, stderr, stdout } of results) {
    if (success) continue;

    const _cmd = JSON.stringify(command);
    let message = `Command failed with exit code ${code} for ${_cmd}.`;

    if (stderr) message += `\n\nstderr:\n${indent(stderr, 2)}`;
    if (stdout) message += `\n\nstdout:\n${indent(stdout, 2)}`;

    console.log(message);
  }
}
