/** Returns the items in a collection with the smallest `"length"` property.
 *
 * @example
 * smallest(["a", "bb", "c", "ddd"]); // ["a", "c"]
 */
export function smallest<T extends { length: number }>(items: Iterable<T>): T[];
/** Returns the items in a collection with the smallest value for a given
 * property.
 *
 * @example
 * smallest("length", ["a", "bb", "c", "ddd"]); // ["a", "c"]
 *
 * @example
 * smallest("size", [new Set([1, 2]), new Set([1, 2, 3])]); // [Set([1, 2])]
 */
export function smallest<P extends string, T extends { [K in P]: number }>(
  property: P,
  items: Iterable<T>,
): T[];
export function smallest(
  // deno-lint-ignore no-explicit-any
  arg1: string | Iterable<any>,
  // deno-lint-ignore no-explicit-any
  arg2?: Iterable<any>,
) {
  const [property, items] = typeof arg1 === "string"
    ? [arg1, arg2!]
    : ["length", arg1];

  const smallest = [];
  let smallestSize = Infinity;

  for (const item of items) {
    const size = item[property];
    if (size < smallestSize) {
      smallestSize = size;
      smallest.length = 0;
      smallest.push(item);
    } else if (size === smallestSize) {
      smallest.push(item);
    }
  }

  return smallest;
}
