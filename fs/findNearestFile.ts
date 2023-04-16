import { dirname, resolve } from "../_deps/path.ts";

/**
 * Searches `fromDir` and upwards for `fileName`
 *
 * @returns the full file path, or `undefined` if the file wasn't found
 */
export async function findNearestFile(
  fromDir: string,
  fileName: string,
): Promise<string | undefined> {
  while (fromDir.length) {
    for await (const { isDirectory, name } of Deno.readDir(fromDir)) {
      if (isDirectory || name !== fileName) continue;

      return resolve(fromDir, fileName);
    }

    const newFromDir = dirname(fromDir);

    if (fromDir === newFromDir) break;

    fromDir = newFromDir;
  }

  return undefined;
}
