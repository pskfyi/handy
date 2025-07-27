import type { Pretty } from "../ts/types.ts";
import * as _JsonPointer from "./_pointer/mod.ts";

/** JSON Pointer implementation, with utilities, based on [the official
 * spec](https://datatracker.ietf.org/doc/html/rfc6901).
 *
 * ## Types
 *
 * ```ts
 * JsonPointer.Token;        // string (escaping `/` and `~`)
 * JsonPointer.RootPointer;  // ""
 * JsonPointer.ChildPointer; // `/${string}` (sequence of `/`-separated Tokens)
 * JsonPointer.Pointer;      // RootPointer | ChildPointer
 * ```
 *
 * ## Utilities
 *
 * ### Type Guards
 *
 * Return a `boolean` indicating whether the input is the required type.
 *
 * See: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 *
 * ```ts
 * JsonPointer.isToken(input);
 * JsonPointer.isPointer(input);
 * ```
 *
 * #### Type Assertions
 *
 * Same as the above type guards, except they throw when the input is not the required type.
 *
 * See: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
 *
 * ```ts
 * JsonPointer.assertToken(input);
 * JsonPointer.assertPointer(input);
 * ```
 *
 * ### Token Utilities
 *
 * #### Escaping & Unescaping
 *
 * JSON Pointer escapes `/` as `~1` and `~` as `~0`.
 *
 * ```ts
 * JsonPointer.escape(string);       // "/" -> "~1";  "~" -> "~0"
 * JsonPointer.unescape(token);      // "~1" -> "/";  "~0" -> "~"
 * JsonPointer.isEscaped(string);    // "~" -> false; "~0" -> true
 * JsonPointer.isUnescaped(string);  // "~" -> true;  "~0" -> false
 * ```
 *
 * #### Encoding & Decoding
 *
 * Encoded tokens are escaped and stringified. Decoded tokens are unescaped,
 * and unsigned integers with no leading zeroes are converted from strings to
 * numbers.
 *
 * ```ts
 * JsonPointer.encodeToken(stringOrInteger);  // 7 -> "7"; "~X" -> "~0X"
 * JsonPointer.decodeToken(token);   // "7" -> 7; "~0X" -> "~X"; "007" -> "007"
 * ```
 *
 * ### Pointer Utilities
 *
 * #### General
 *
 * ```ts
 * JsonPointer.parent(pointer);      // "/foo/bar" -> "/foo"
 * ```
 *
 * #### Encoding & Decoding
 *
 * ```ts
 * JsonPointer.encode(path);           // ["f~o", "b/r"] -> "/f~0o/b~1r"
 * JsonPointer.decode(string);         // "/f~0o/b~1r" -> ["f~o", "b/r"]
 * JsonPointer.parsePointer(pointer);  // decode w/o typechecking
 * ```
 *
 * ### Usage With `JsonTree`
 *
 * The `JsonTree` module implements most of the utilities that you'd want to
 * use with JSON Pointers, but with more guardrails and fewer gotchas. You can
 * solve most headaches associated with normal JSON Pointer operations via the
 * following conversions:
 *
 * 1. Use `JsonPointer.decode()` to convert a `Pointer` to the more
 * straightforward `JsonTree.Path` data type, which is just an array of
 * integers and strings - no funky escape characters to bother about. You can
 * use `JsonPointer.encode()` to convert back to a `Pointer` where needed.
 *
 * 2. Use `JsonTree.isTree()` or `JsonTree.assertTree()` to confirm that a
 * `Document` is a JSON Array or Object before you try to index into it.
 *
 * #### Examples
 *
 * Check if a pointer location exists within a document.
 *
 * ```ts
 * import { has, isTree } from "/path/to/JsonTree/mod.ts";
 * import { ChildPointer, decode } from "/path/to/JsonPointer/mod.ts";
 *
 * function hasPointer(document: unknown, pointer: ChildPointer): boolean {
 *   const path = decode(pointer);
 *
 *   return isTree(document) && has(document, path);
 * }
 *
 * hasPointer([7], "/0"); // true
 * hasPointer([7], "/foo"); // false
 * hasPointer({ "A": [5, 6, 7] }, "/A/2"); // true
 * ```
 *
 * Retrieve a value from a document at a pointer location.
 *
 * ```ts
 * import { assertTree, get } from "/path/to/JsonTree/mod.ts";
 * import { decode, Pointer } from "/path/to/JsonPointer/mod.ts";
 *
 * function getPointer(document: unknown, pointer: Pointer) {
 *   if (pointer === "") return document;
 *
 *   assertTree(document);
 *   const path = decode(pointer);
 *
 *   return get(document, path);
 * }
 *
 * getPointer([7], "/0"); // 7
 * getPointer([7], "/foo"); // throws error because get() fails
 * getPointer(null, ""); // null
 * getPointer(null, "/foo"); // throws error because assertTree() fails
 * getPointer({ "A": [5, 6, 7] }, "/A/0"); // 5
 * getPointer({ "A": [5, 6, 7] }, "/A/1"); // 6
 * getPointer({ "A": [5, 6, 7] }, "/A/2"); // 7
 * ```
 *
 * Crawl through the leaf nodes of a document and store the pointer for each
 * location whose value is a number.
 *
 * ```ts
 * import { crawlLeaves, Tree } from "/path/to/JsonTree/mod.ts";
 * import { encode, Pointer } from "/path/to/JsonPointer/mod.ts";
 *
 * const document: Tree = {
 *   "A": [1, "Hello!", 2],
 *   "B": [false, 3, null],
 * };
 *
 * const pointersToNumbers: Pointer[] = [];
 *
 * crawlLeaves(document, (location) => {
 *   if (typeof location.node === "number") {
 *     const pointer = encode(location.path);
 *     pointersToNumbers.push(pointer);
 *   }
 * });
 *
 * console.log(pointersToNumbers); // ["/A/0", "/A/2", "/B/1"]
 * ``` */
const JsonPointer: Pretty<typeof _JsonPointer> = _JsonPointer;
declare namespace JsonPointer {
  export type ChildPointer = _JsonPointer.ChildPointer;
  export type Pointer = _JsonPointer.Pointer;
  export type RootPointer = _JsonPointer.RootPointer;
  export type Token = _JsonPointer.Token;
}

export { JsonPointer };
