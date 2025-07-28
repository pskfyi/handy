/** @module
 *
 * Util for finding the smallest items in a collection. Defaults to determining
 * size by the `"length"` property, but it can be configured. */

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
export function smallest<P extends string, T extends { [K in P]: number }>(
  arg1: P | Iterable<T>,
  arg2?: Iterable<T>,
): T[] {
  const [property, items] = typeof arg1 === "string"
    ? [arg1, arg2!]
    : ["length" as P, arg1];

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
