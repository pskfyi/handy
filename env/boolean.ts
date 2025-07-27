/** Return an environment variable value as a boolean. Handles `"false"`,
 * `"0"`, `""`, and `undefined` as `false`, everything else as `true`. */
export function boolean(name: string): boolean {
  const value = Deno.env.get(name);

  return typeof value === "string" &&
    value.length > 0 &&
    value.toLowerCase() !== "false" &&
    value !== "0";
}
