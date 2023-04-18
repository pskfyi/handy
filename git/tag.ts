import { sort as semverSort } from "../_deps/semver.ts";
import { _internals } from "../_test/_internals.ts";

/** Get all tags in the git repository at the current working directory. */
export async function get(): Promise<string[]>;
/** Get all tags in the git repository at the given path. */
export async function get(path?: string): Promise<string[]>;
export async function get(cwd?: string): Promise<string[]> {
  const tagList = await _internals.cmd(`git tag`, { cwd });

  return tagList.split("\n").filter((line) => line);
}

/** Get the latest semver tag in the git repository at the current working
 * directory, falling back to alphabetical sorting if all tags are not semver.
 */
export async function getLatest(): Promise<string>;
/** Get the latest semver tag in the git repository at the given path, falling back to alphabetical sorting if all tags are not semver. */
export async function getLatest(path: string): Promise<string>;
export async function getLatest(cwd?: string): Promise<string> {
  const tags = await get(cwd);

  if (!tags.length) throw new Error("No tags found");

  let tagsSorted: string[];

  try {
    tagsSorted = semverSort(tags);
  } catch {
    tagsSorted = tags.sort();
  }

  return tagsSorted.at(-1)!;
}
