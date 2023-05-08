/** Represent an object type with all properties merged into the top level,
 * handling intersections (`&`).
 *
 * @example
 * type USCity = { city: string, state: string };
 * type USAddress = USCity & { street: string, zip: string };
 * //   ^? USCity & { street: string, zip: string }
 *
 * type USAddress = Intersect<USCity & { street: string, zip: string }>;
 * //   ^? { city: string, state: string, street: string, zip: string } */
// deno-lint-ignore no-explicit-any
export type Intersect<T extends Record<any, any>> = { [K in keyof T]: T[K] };
