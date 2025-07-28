/** @module
 *
 * Util for finding the largest items in a collection. Defaults to determining
 * size by the `"length"` property, but it can be configured. */

/** Returns the items in a collection with the largest `"length"` property.
 *
 * @example
 * largest(["a", "bb", "c", "ddd"]); // ["a", "c"]
 */
export function largest<T extends { length: number }>(items: Iterable<T>): T[];
/** Returns the items in a collection with the largest value for a given
 * property.
 *
 * @example
 * largest("length", ["a", "bb", "c", "ddd"]); // ["a", "c"]
 *
 * @example
 * largest("size", [new Set([1, 2]), new Set([1, 2, 3])]); // [Set([1, 2])]
 */
export function largest<P extends string, T extends { [K in P]: number }>(
  property: P,
  items: Iterable<T>,
): T[];
export function largest<P extends string, T extends { [K in P]: number }>(
  arg1: P | Iterable<T>,
  arg2?: Iterable<T>,
): T[] {
  const [property, items] = typeof arg1 === "string"
    ? [arg1, arg2!]
    : ["length" as P, arg1];

  const largest = [];
  let largestSize = -Infinity;

  for (const item of items) {
    const size = item[property];
    if (size > largestSize) {
      largestSize = size;
      largest.length = 0;
      largest.push(item);
    } else if (size === largestSize) {
      largest.push(item);
    }
  }

  return largest;
}
