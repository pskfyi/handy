import type { Pretty } from "../ts/types.ts";

/** A valid object key. */
export type Key = string | number | symbol;

/** An object with no keys.
 *
 * @example
 * const empty: EmptyObject = {};
 * const empty2: EmptyObject = { a: 1 }; // Error */
export type EmptyObject = Record<Key, never>;

/** A key-value tuple. Similar to the outputs of `Object.entries` and the inputs
 * to `Object.fromEntries`, except numbers are not stringified and symbols are
 * allowed. This is primarily used for `extends` clauses to ensure that an input
 * conforms to this shape.
 *
 * @example
 * type MyEntry = Entry<unknown>; // [Key, unknown] */
export type Entry<V = unknown> = [key: Key, value: V];

/** An object intended to house a single key-value pair. The object-shaped
 * equivalent of `Entry`. Mostly the same as TS's builtin `Record` type but
 * provided here for parity with other object types.
 *
 * @example
 * type MyPair = Pair<"a", 1>;
 * // { a: 1 } */
export type Pair<K extends Key, V> = Pretty<{ [_ in K]: V }>;

/** Converts an `Entry` to an `Pair`.
 *
 * @example
 * type MyPair = EntryToPair<["a", 1]>;
 * // { a: 1 } */
export type EntryToPair<T extends Entry> = T extends
  [infer K extends Key, infer Value] ? Pair<K, Value>
  : never;

type _EntriesToObject<T> = T extends [infer Head extends Entry, ...infer Tail]
  ? EntryToPair<Head> & _EntriesToObject<Tail>
  : Record<never, never>;

/** Converts an array of `Entry`s to an object. Analogous to
 * `Object.fromEntries`.
 *
 * @example
 * type MyObj = FromEntries<[["a", 1], ["b", 2]]>;
 * // { a: 1, b: 2 } */
export type FromEntries<T extends Entry[]> = Pretty<_EntriesToObject<T>>;

/** Convert an object to an array of `Entry`s. Unfortunately, this cannot return
 * a tuple which would preserve the order of the keys, due to current
 * limitations in TypeScript.
 *
 * @example
 * type MyEntries = Obj.ToEntries<{ a: 1, b: 2 }>;
 * // Array<["a", 1], ["b", 2]> */
export type ToEntries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];

export declare namespace Obj {
  export {
    EmptyObject as Empty,
    Entry,
    EntryToPair,
    FromEntries,
    Key,
    Pair,
    ToEntries,
  };
}
