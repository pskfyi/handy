import type { Tuple } from "../array/types.ts";

/** Represents a tuple of the characters of `T`.
 *
 * @example
 * type A = ToTuple<"abc"> // ["a", "b", "c"] */
export type ToTuple<T extends string> = T extends `${infer Char}${infer Chars}`
  ? [Char, ...ToTuple<Chars>]
  : [];

/** Represents one of the characters of `T`.
 *
 * @example
 * type A = Char<"abcbca"> // "a" | "b" | "c" */
export type Char<T extends string> = ToTuple<T>[number];

/** Represents a tuple of the indices of `T`.
 *
 * @example
 * type A = Indices<"abc"> // [0, 1, 2] */
export type Indices<T extends string> = Tuple.Indices<ToTuple<T>>;

/** Represents one of the indices of `T`.
 *
 * @example
 * type A = Index<"abc"> // 0 | 1 | 2 */
export type Index<T extends string> = Indices<T>[number];

/** Returns `string` if `T` is exactly `string`, otherwise returns `never`.
 *
 * @example
 * type A = Wide<string> // string
 * type B = Wide<"abc"> // never */
export type Wide<T extends string> = T extends infer U //
  ? string extends U // If `string` is `U`...
    ? string // then `T` is exactly `string`
  : never
  : never;

export declare namespace Str {
  export { Char, Index, Indices, ToTuple, Wide };
}
