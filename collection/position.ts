import { Tuple } from "../array/types.ts";
import { Str } from "../string/types.ts";
import { Satisfies } from "../ts/types.ts";
import { IndexedCollection } from "./types.ts";

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

export function next<
  const C extends IndexedCollection,
  P extends Position<C>,
>(
  value: P,
  collection: C,
): P | null {
  return (value < collection.length) ? (value + 1) as P : null;
}

export function previous<
  const C extends IndexedCollection,
  P extends Position<C>,
>(
  value: P,
): P | null {
  return (value > 0) ? (value - 1) as P : null;
}
