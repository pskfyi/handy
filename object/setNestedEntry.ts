/**
 * Mutates `obj` adding or overwriting a `val` at the end of a chain of `keys`,
 * creating intermediate objects as needed.
 *
 * @example
 * const s = Symbol("")
 * const val = () => {}
 * addNestedEntry({}, ["a", 2, 1], val) // { a: { 2: { [s]: val } } }
 */
export function setNestedEntry<
  T extends Record<string | number | symbol, unknown>,
>(
  obj: T,
  keys: Array<string | number | symbol>,
  // deno-lint-ignore no-explicit-any
  val: any,
) {
  const key = keys.shift() as keyof T;

  if (!(key in obj)) obj[key] = {} as T[keyof T];

  obj[key] = (keys.length)
    ? setNestedEntry(obj[key] as Record<string, unknown>, keys, val)
    : val;

  return obj;
}
