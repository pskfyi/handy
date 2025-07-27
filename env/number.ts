/** Return an environment variable value as a number if it can be cast to an
 * integer or float, or null otherwise. */
export function number(name: string): number | null {
  const value = Number(Deno.env.get(name));

  if (isNaN(value)) return null;
  if (value === Infinity || value === -Infinity) return null;

  return value;
}
