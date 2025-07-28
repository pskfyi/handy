import type { Tuple } from "../array/types.ts";
import type { Str } from "../string/types.ts";

/** @module
 *
 * Types related to collection indices. */

/** A type that can be indexed by a number and has a `length` property.
 *
 * @example
 * const foo: IndexedCollection = ["a", "b", "c"]
 * const bar: IndexedCollection = new Uint16Array(4)
 * const baz: IndexedCollection = "abc" */
export type IndexedCollection = ArrayLike<unknown>;

/** Represents a tuple of the indices of `T`.
 *
 * @example
 * type A = Indices<["a", "b", "c"]> // [0, 1, 2]
 * type B = Indices<Uint16Array> // number[]
 * type C = Indices<"abc"> // [0, 1, 2] */
export type Indices<T extends IndexedCollection> = T extends string
  ? Str.Indices<T>
  : T extends readonly unknown[] ? Tuple.Indices<T>
  : number[]; // If `T` is not a string or array, can't infer specific indices.

/** Represents one of the indices of `T`.
 *
 * @example
 * type A = Index<"abc"> // 0 | 1 | 2
 * type B = Index<Uint16Array> // number
 * type C = Index<["a", "b", "c"]> // 0 | 1 | 2 */
export type Index<T extends IndexedCollection> = Indices<T>[number];
