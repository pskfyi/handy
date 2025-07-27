import type { JsonObject } from "../json/types.ts";

export async function readJsonFile<T = JsonObject>(
  path: string | URL,
): Promise<T> {
  const content = await Deno.readTextFile(path);
  return JSON.parse(content) as T;
}

export function readJsonFileSync<T = JsonObject>(path: string | URL): T {
  const content = Deno.readTextFileSync(path);
  return JSON.parse(content) as T;
}

export async function writeJsonFile<T = JsonObject>(
  path: string | URL,
  data: T,
) {
  const content = JSON.stringify(data, null, 2) + "\n";
  await Deno.writeTextFile(path, content);
}

export function writeJsonFileSync<T = JsonObject>(path: string | URL, data: T) {
  const content = JSON.stringify(data, null, 2) + "\n";
  Deno.writeTextFileSync(path, content);
}

export async function replaceJsonFile<T = JsonObject, U = T>(
  path: string | URL,
  callback: (data: T) => U,
): Promise<void> {
  const data = await readJsonFile<T>(path);
  await writeJsonFile(path, callback(data));
}

export function replaceJsonFileSync<T = JsonObject, U = T>(
  path: string | URL,
  callback: (data: T) => U,
): void {
  const data = readJsonFileSync<T>(path);
  writeJsonFileSync(path, callback(data));
}
