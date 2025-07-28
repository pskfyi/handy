/**
 * @module
 *
 * Utils for handling environment variables in Deno. Normally env vars are all
 * strings, though many times they are intended to be used as booleans or
 * numbers. These utils bridge that gap. */

/** Return an environment variable value as a boolean. Handles `"false"`,
 * `"0"`, `""`, and `undefined` as `false`, everything else as `true`. */
export function boolean(name: string): boolean {
  const value = Deno.env.get(name);

  return typeof value === "string" &&
    value.length > 0 &&
    value.toLowerCase() !== "false" &&
    value !== "0";
}

/** Return an environment variable value as a number if it can be cast to an
 * integer or float, or null otherwise. */
export function number(name: string): number | null {
  const value = Number(Deno.env.get(name));

  if (isNaN(value)) return null;
  if (value === Infinity || value === -Infinity) return null;

  return value;
}

/** Return an environment variable value as a string. Casts `undefined` to
 * `""`. */
export function string(name: string): string {
  return Deno.env.get(name) ?? "";
}
