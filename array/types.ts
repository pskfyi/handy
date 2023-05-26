/** Represents an array whose items are replaced with `Value`.
 *
 * @example
 * type A = Fill<[1, 2, 3], "a"> // ["a", "a", "a"]
 * type B = Fill<Array<unknown>, "b"> // Array<"b"> */
export type Fill<T extends unknown[], Value> = {
  [K in keyof T]: Value;
};

/** Represents an array flattened one level deep, analogous to
 * `Array.prototype.flat()`.
 *
 * @example
 * const items: Flat<[1, 2, [3, [4], 5]]> = [1, 2, 3, [4], 5]; */
export type Flat<T extends unknown[]> = T extends [infer Head, ...infer Tail]
  ? Head extends unknown[] ? [...Head, ...Flat<Tail>]
  : [Head, ...Flat<Tail>]
  : [];

/** Represents an array reversed, analogous to `Array.prototype.reverse()`.
 *
 * @example
 * const items: Reverse<[1, 2, 3]> = [3, 2, 1] */
export type Reverse<T extends unknown[]> = T extends [infer Head, ...infer Tail]
  ? [...Reverse<Tail>, Head]
  : [];

type _Indices<T extends unknown[]> = T extends [unknown, ...infer Tail]
  ? [Tail["length"], ..._Indices<Tail>]
  : [];

/** Represents a tuple of the indices of `T`.
 *
 * @example
 * type A = Indices<["a", "b", "c"]> // [0, 1, 2] */
export type Indices<T extends unknown[]> = Reverse<_Indices<T>>;

/** Represents one of the indices of `T`.
 *
 * @example
 * type A = Index<["a", "b", "c"]> // 0 | 1 | 2 */
export type Index<T extends unknown[]> = Indices<T>[number];

type _FromIndices<T extends unknown[], I> = I extends
  [infer Head extends keyof T, ...infer Tail extends Array<keyof T>]
  ? [T[Head], ..._FromIndices<T, Tail>]
  : [];

/** Represents a tuple composed from values of `T` at the indices `I`.
 *
 * @example
 * type A = FromIndices<["n", "s", "o"], [1, 2, 2, 0]>
 * // ["s", "o", "o", "n"] */
export type FromIndices<T extends unknown[], I extends Index<T>[]> =
  _FromIndices<T, I>;

/** Represents an array of length-2 tuples comprised of two arrays zippered
 * together.
 *
 * @example
 * type A = Zip<[1, 2, 3], ["a", "b", "c"]>
 * // [[1, "a"], [2, "b"], [3, "c"]] */
export type Zip<A extends unknown[], B extends unknown[]> = A extends
  [infer HeadA, ...infer TailA]
  ? B extends [infer HeadB, ...infer TailB]
    ? [[HeadA, HeadB], ...Zip<TailA, TailB>]
  : []
  : [];

/** Array utility types which are designed to respect tuples. */
export declare namespace Tuple {
  export { Fill, Flat, FromIndices, Index, Indices, Reverse, Zip };
}