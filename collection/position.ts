import type { Tuple } from "../array/types.ts";
import type { Str } from "../string/types.ts";
import type { Satisfies } from "../ts/types.ts";
import type { IndexedCollection } from "./types.ts";

/**
 * @module
 *
 * Utils and types for working with positions in indexed collections, with
 * helpful string representations useful for debugging, logging, and error
 * messages. */

/** Describes index-like locations within an indexed collection, such as an
 * array or string. Unlike an index, a position refers to a location *between*
 * items.
 *
 * ```
 *      [ "example item" ]
 *       ^              ^
 *       |              |
 *   position 0     position 1
 * ```
 *
 * `0` is always a valid position, even for an empty collection, as is the
 * collection's `length`. Positions are always positive.
 *
 * @example
 * type A = Positions<["a", "b", "c"]> // [0, 1, 2, 3]
 * type B = Positions<Uint16Array> // number[]
 * type C = Positions<"abc"> // [0, 1, 2, 3]
 * type D = Positions<string> // [0, 1, 2, 3] */
export type Positions<C extends IndexedCollection> = C extends string
  ? Satisfies<Str.Wide<C>> extends false // If it's not `string`...
    ? Str.Indices<` ${C}`> // then it's a specific string; get its indices
  : number[] // otherwise, it's just `string`; no indices inferrable
  : C extends readonly unknown[] // If it's an array...
    ? Tuple.Indices<[never, ...C]> // then get its indices
  : number[]; // otherwise, no indices inferrable (ex. typed arrays)

/** Represents one of the positions within `T`. Unlike an index, a position
 * refers to a location *between* items.
 *
 * ```
 *      [ "example item" ]
 *       ^              ^
 *       |              |
 *   position 0     position 1
 * ```
 *
 * `0` is always a valid position, even for an empty collection, as is the
 * collection's `length`. Positions are always positive.
 *
 * @example
 * type A = Position<["a", "b", "c"]> // 0 | 1 | 2 | 3
 * type B = Position<Uint16Array> // number
 * type C = Position<"abc"> // 0 | 1 | 2 | 3
 * type D = Position<string> // number */
export type Position<C extends IndexedCollection> = Positions<C>[number];

function _assertPositionLike<C extends IndexedCollection>(
  value: number,
  collection: C,
): void {
  if (!Number.isInteger(value)) {
    throw new TypeError("Position value must be an integer");
  }
  if (value > collection.length) {
    throw new TypeError("Position value is beyond the collection's end");
  }
  if (-value > collection.length) {
    throw new TypeError("Position value is beyond the collection's start");
  }
}

/** Validates and normalizes the `value` against the `collection`'s length.
 *
 * Negative `inputValue`s count from the end of the collection, with
 * `-0` referring to the last position (same as `collection.length`), `-1`
 * referring to the second-to-last position, and so on.
 *
 * @throws {TypeError} if `value` is positive and beyond the collection's end, or negative and beyond the collection's start, or not an integer.
 *
 * @example
 * new Position(0, "a");  // 0, the position before the "a"
 * new Position(1, "a");  // 1, the position after the "a"
 * new Position(-0, "a"); // 1, the position after the "a"
 * new Position(-1, "a"); // 0, the position before the "a"
 * new Position(2, "a");  // throws
 * new Position(-2, "a"); // throws */
export function toPosition<C extends IndexedCollection>(
  value: number,
  collection: C,
): Position<C> {
  _assertPositionLike(value, collection);

  const isNegative = value < 0 || Object.is(value, -0);

  return isNegative ? collection.length + value : value;
}

/** @throws {TypeError} if `value` is positive and beyond the collection's end, or negative and beyond the collection's start, or not an integer. */
export function assert<C extends IndexedCollection>(
  value: number,
  collection: C,
): asserts value is Position<C> {
  _assertPositionLike(value, collection);

  if (value < 0) throw new TypeError("Position value must be positive");
  if (value > collection.length) {
    throw new TypeError("Position value is beyond the collection's end");
  }
}

/** Checks if the `value` is a valid position within the `collection`.
 *
 * @returns true if the value is a valid position, false otherwise.
 *
 * @example
 * isPosition(0, []); // Every collection has a 0 position.
 * isPosition(1, []); // false, no position after the 0.
 * isPosition(1, ["a", "b"]); // true, the position after the "a". */
export function isPosition<C extends IndexedCollection>(
  value: number,
  collection: C,
): value is Position<C> {
  try {
    assert(value, collection);
    return true;
  } catch {
    return false;
  }
}

/** Returns the next position in the collection, or `null` if there is no next
 * position (i.e., if the value is equal to the collection's length).
 *
 * @example
 * next(0, ["a", "b"]); // 1, the position after the "a"
 * next(1, ["a", "b"]); // 2, the position after the "b"
 * next(2, ["a", "b"]); // null, no position after the end */
export function next<
  const C extends IndexedCollection,
  P extends Position<C>,
>(
  value: P,
  collection: C,
): P | null {
  return (value < collection.length) ? (value + 1) as P : null;
}

/** Returns the previous position in the collection, or `null` if there is no
 * previous position (i.e., if the value is `0`).
 *
 * @example
 * previous(0, ["a", "b"]); // null
 * previous(1, ["a", "b"]); // 0, the position before the "a"
 * previous(2, ["a", "b"]); // 1, the position before the "b" */
export function previous<
  const C extends IndexedCollection,
  P extends Position<C>,
>(
  value: P,
): P | null {
  return (value > 0) ? (value - 1) as P : null;
}
