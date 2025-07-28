/** @module
 *
 * Provides utility types for working with arrays and tuples in TypeScript. */

/** One of the JS built-in typed arrays. */
export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

/** Represents an array whose items are replaced with `Value`.
 *
 * @example
 * type A = Fill<[1, 2, 3], "a"> // ["a", "a", "a"]
 * type B = Fill<Array<unknown>, "b"> // Array<"b"> */
export type Fill<T extends readonly unknown[], Value> = T extends
  readonly [infer _Head, ...infer Tail] // If T is a tuple...
  ? [Value, ...Fill<Tail, Value>] // ...replace the first item with Value and recurse.
  : never; // Otherwise, return never (should not happen).

/** Represents an array flattened one level deep, analogous to
 * `Array.prototype.flat()`.
 *
 * @example
 * type Tup = Flat<[1, 2, [3, [4], 5]]> // [1, 2, 3, [4], 5];
 * type Arr = Flat<number[][]> // number[]
 * type Arr2D = Flat<number[][]> // number[]
 * type Mix = Flat<["A", ["B", "C"][]]> // ["A", ...["B", "C"][]] */
export type Flat<T extends readonly unknown[]> = T extends
  readonly [infer Head, ...infer Tail] // If the first and rest are inferable...
  ? Head extends unknown[] // ...and the first is an array...
    ? [...Head, ...Flat<Tail>] // ...spread it then recurse on the rest.
  : [Head, ...Flat<Tail>] // Otherwise, keep the first and recurse.
  //
  : T extends readonly [] ? [] // It T is empty, return an empty array.
  //
  : T extends Array<infer Item extends unknown> // If T is a non-tuple array...
    ? Item extends unknown[] // ...and it contains an array...
      ? [...Item] // ...spread it.
    : Item[] // Otherwise, keep it.
  : [];

/** Represents an array reversed, analogous to `Array.prototype.reverse()`.
 *
 * @example
 * const items: Reverse<[1, 2, 3]> = [3, 2, 1] */
export type Reverse<T extends readonly unknown[]> = T extends
  readonly [infer Head, ...infer Tail] ? [...Reverse<Tail>, Head]
  : [];

type _Indices<T extends readonly unknown[]> = T extends
  readonly [unknown, ...infer Tail] ? [Tail["length"], ..._Indices<Tail>]
  : [];

/** Represents a tuple of the indices of `T`.
 *
 * @example
 * type A = Indices<["a", "b", "c"]> // [0, 1, 2] */
export type Indices<T extends readonly unknown[]> = Reverse<_Indices<T>>;

/** Represents one of the indices of `T`.
 *
 * @example
 * type A = Index<["a", "b", "c"]> // 0 | 1 | 2 */
export type Index<T extends readonly unknown[]> = Indices<T>[number];

type _FromIndices<T extends readonly unknown[], I> = I extends
  readonly [infer Head extends keyof T, ...infer Tail extends Array<keyof T>]
  ? [T[Head], ..._FromIndices<T, Tail>]
  : [];

/** Represents a tuple composed from values of `T` at the indices `I`.
 *
 * @example
 * type A = FromIndices<["n", "s", "o"], [1, 2, 2, 0]>
 * // ["s", "o", "o", "n"] */
export type FromIndices<
  T extends readonly unknown[],
  I extends readonly Index<T>[],
> = _FromIndices<T, I>;

/** Represents an array of length-2 tuples comprised of two arrays zippered
 * together.
 *
 * @example
 * type A = Zip<[1, 2, 3], ["a", "b", "c"]>
 * // [[1, "a"], [2, "b"], [3, "c"]] */
export type Zip<A extends readonly unknown[], B extends readonly unknown[]> =
  A extends readonly [infer HeadA, ...infer TailA]
    ? B extends readonly [infer HeadB, ...infer TailB]
      ? [[HeadA, HeadB], ...Zip<TailA, TailB>]
    : []
    : [];

/** Represents a tuple of length `N` comprised of `unknown` values.
 *
 * @example
 * type A = TupleOfLength<3> // [unknown, unknown, unknown] */
export type TupleOfLength<N extends number, Tuple extends unknown[] = []> =
  Tuple["length"] extends N // When Tuple is finally of length N...
    ? Tuple // ...return it.
    : TupleOfLength<N, [...Tuple, unknown]>; // Otherwise, add another item.

/** Array utility types which are designed to respect tuples. */
export declare namespace Tuple {
  export {
    Fill,
    Flat,
    FromIndices,
    Index,
    Indices,
    Reverse,
    TupleOfLength as OfLength,
    Zip,
  };
}
