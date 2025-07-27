/** Return an environment variable value as a string. Casts `undefined` to
 * `""`. */
export function string(name: string): string {
  return Deno.env.get(name) ?? "";
}
