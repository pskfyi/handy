import type * as Json from "../json/types.ts";

/** @module
 *
 * Utils for reading and writing JSON files in Deno. */

export async function readJsonFile<T = Json.Object>(
  path: string | URL,
): Promise<T> {
  const content = await Deno.readTextFile(path);
  return JSON.parse(content) as T;
}

export function readJsonFileSync<T = Json.Object>(path: string | URL): T {
  const content = Deno.readTextFileSync(path);
  return JSON.parse(content) as T;
}

export async function writeJsonFile<T = Json.Object>(
  path: string | URL,
  data: T,
) {
  const content = JSON.stringify(data, null, 2) + "\n";
  await Deno.writeTextFile(path, content);
}

export function writeJsonFileSync<T = Json.Object>(
  path: string | URL,
  data: T,
) {
  const content = JSON.stringify(data, null, 2) + "\n";
  Deno.writeTextFileSync(path, content);
}

export async function replaceJsonFile<T = Json.Object, U = T>(
  path: string | URL,
  callback: (data: T) => U,
): Promise<void> {
  const data = await readJsonFile<T>(path);
  await writeJsonFile(path, callback(data));
}

export function replaceJsonFileSync<T = Json.Object, U = T>(
  path: string | URL,
  callback: (data: T) => U,
): void {
  const data = readJsonFileSync<T>(path);
  writeJsonFileSync(path, callback(data));
}
