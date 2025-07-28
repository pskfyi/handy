/** @module
 *
 * Utils for editing text files in Deno. */

export async function replaceTextFile(
  path: string | URL,
  callback: (content: string) => string,
): Promise<void> {
  const content = await Deno.readTextFile(path);
  await Deno.writeTextFile(path, callback(content));
}

export function replaceTextFileSync(
  path: string | URL,
  callback: (content: string) => string,
): void {
  const content = Deno.readTextFileSync(path);
  Deno.writeTextFileSync(path, callback(content));
}
