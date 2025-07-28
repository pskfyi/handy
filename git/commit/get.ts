import { _internals } from "../../_test/_internals.ts";
import { dedent } from "../../string/dedent.ts";
import type { CommitDescription } from "./types.ts";
import { COMMIT_LOG_REGEX } from "./regex.ts";

/** @module
 *
 * Utils for obtaining commit information from Git. */

/** Given the raw output of `git log`, split it into an array of commits */
export function splitLog(log: string): string[] {
  return log.split(/\n(?=commit)/);
}

/** Given the raw output and default format of one commit from `git log`,
 * convert the commit details into an ergonomic object.
 *
 * @example
 * const log = await cmd("git log -1 1234567890").then((res) => res.stdout);
 * describe(log); // { date: Date, hash: "123...", message: "...", author: ... }
 */
export function describe(details: string): CommitDescription {
  const { hash, name, email, date, message } = details
    .match(COMMIT_LOG_REGEX)?.groups ?? {};

  if (!hash || !name || !email || !date || !message) {
    throw new TypeError(`Invalid commit`);
  }

  return {
    hash,
    author: { name, email },
    date: new Date(date),
    message: dedent(message).trim(),
  };
}

export async function get(
  hash: string,
  { cwd }: { cwd?: string } = {},
): Promise<CommitDescription> {
  if (hash.includes(" ") || hash.includes("..")) {
    throw new Error(`Invalid hash: ${hash}`);
  }

  try {
    return describe(await _internals.cmd(`git log -1 ${hash}`, { cwd }));
  } catch (error) {
    throw new Error(`Failed to get commit ${hash}`, { cause: error });
  }
}

/** Get commits between two hashes or refs, excluding first commit by default.
 *
 * When `opts.inclusive` is `true`, the first commit will always be included
 * if it exists, even if it is not an ancestor of the second commit.
 *
 * @example
 * await getSpan(["abc1234", "def5678"]);
 * // similar to: git log abc1234..def5678 w/ parsing
 * await getSpan(["abc1234", "def5678"], { inclusive: true });
 * // similar to: git log abc1234^..def5678 w/ parsing
 *
 * @example
 * await getSpan(["1.0.0", "HEAD"]); */
export async function getSpan(
  [start, end]: [string, string],
  { cwd, inclusive }: { cwd?: string; inclusive?: boolean } = {},
): Promise<CommitDescription[]> {
  try {
    const results: CommitDescription[] = [];

    if (inclusive) results.push(await get(start, { cwd }));

    const stdout = await _internals.cmd(`git log ${start}..${end}`, { cwd });

    if (stdout === "") return results;

    for (const commit of splitLog(stdout)) {
      results.push(describe(commit));
    }

    return results;
  } catch (error) {
    throw new Error(
      `Failed to get commits between ${start} and ${end}`,
      { cause: error },
    );
  }
}
