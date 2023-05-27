import { Satisfies } from "../ts/types.ts";

/** Maps `T` to a string literal type describing its number type.
 * - `number` for `number`
 * - `zero` for `0` and `-0` (TS cannot distinguish between them)
 * - `+infinity` for `Infinity`
 * - `-infinity` for `-Infinity`
 * - `+float` for positive floating point numbers
 * - `-float` for negative floating point numbers
 * - `+integer` for positive integers
 * - `-integer` for negative integers
 *
 * @example
 * type Num = NumberType<number> // "number"
 * type Zero = NumberType<0> // "zero"
 * type NegZero = NumberType<-0> // "zero"
 * type Inf = NumberType<1e999> // "+infinity"
 * type NegInf = NumberType<-1e999> // "-infinity"
 * type Flt = NumberType<1.1> // "+float"
 * type NegFlt = NumberType<-1.1> // "-float"
 * type Int = NumberType<1> // "+integer"
 * type NegInt = NumberType<-1> // "-integer" */
export type NumberType<T extends number> = T extends infer N //
  ? number extends N // If `number` is `N`, then `T` is exactly `number`.
    ? "number"
  : N extends number // Otherwise, `T` is a specific number.
    ? `${N}` extends `0` ? "zero" // All the rest is pattern matching.
    : `${N}` extends `-${infer _}.${infer _}` ? "-float"
    : `${N}` extends `${infer _}.${infer _}` ? "+float"
    : `${N}` extends "Infinity" ? "+infinity"
    : `${N}` extends "-Infinity" ? "-infinity"
    : `${N}` extends `-${bigint}` ? "-integer"
    : "+integer"
  : never
  : never;

/** Returns `T` if it is `number`, `Infinity`, or `-Infinity`, otherwise
 * `never`.
 *
 * @example
 * type N = Wide<number> // number
 * type F = Wide<1.1> // never
 * type I = Wide<1> // never */
export type Wide<T extends number> = NumberType<T> extends infer TName
  ? TName extends "number" | "+infinity" | "-infinity" ? T
  : never
  : never;

/** Returns `T` if it is an integer or float, otherwise `never`.
 *
 * @example
 * type N = Finite<number> // never
 * type F = Finite<1.1> // 1.1
 * type I = Finite<1> // 1 */
export type Finite<T extends number> = Satisfies<Wide<T>> extends true ? never
  : T;

/** Returns `T` if it is a float, otherwise `never`.
 *
 * @example
 * type N = Float<number> // never
 * type Flt = Float<1.1> // 1.1
 * type NegFlt = Float<-1.1> // -1.1
 * type Int = Float<1> // never */
export type Float<T extends number> = NumberType<T> extends `${infer _}float`
  ? T
  : never;

/** Returns `T` if it is an integer type, otherwise `never`.
 *
 * @example
 * type Flt = Integer<1.1>; // never
 * type Num = Integer<number> // never
 * type Zero = Integer<0> // 0
 * type NegZero = Integer<-0> // 0, TS cannot distinguish between 0 and -0
 * type Int = Integer<1> // 1
 * type NegInt = Integer<-1> // -1 */
export type Integer<T extends number> = NumberType<T> extends
  `${infer _}integer` | "zero" ? T
  : never;

export declare namespace Num {
  export { Finite, Float, Integer, NumberType as Type, Wide };
}
