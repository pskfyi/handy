/** Represents a type with all properties merged into the top level, handling
 * intersections (`&`), often resulting in more legible shapes particularly
 * for object types.
 *
 * Source: https://twitter.com/mattpocockuk/status/1622730173446557697
 *
 * @example
 * type USCity = { city: string, state: string };
 * type USAddress = USCity & { street: string, zip: string };
 * //   ^? USCity & { street: string, zip: string }
 *
 * type USAddress = Pretty<USCity & { street: string, zip: string }>;
 * //   ^? { city: string, state: string, street: string, zip: string } */
// deno-lint-ignore ban-types
export type Pretty<T> = { [K in keyof T]: T[K] } & {};
