import type { Pretty } from "../ts/types.ts";
import * as _JsonMergePatch from "./_mergePatch/mod.ts";

/** @module
 *
 * JsonMergePatch namespace containing utilities and types for working with
 * JSON Merge Patches. */

/** Homegrown JSON Merge Patch utilities based on [the official
 * spec](https://datatracker.ietf.org/doc/html/rfc7396).
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert/equals";
 *
 * MEDIA_TYPE; // "application/merge-patch+json"
 *
 * // Diff to create a patch
 * const before = { A: 7, B: { C: true } };
 * const after = { A: 7, B: { D: ["Hello"] } };
 *
 * assertEquals(
 *   diff(before, after),
 *   { B: { C: null, D: ["Hello"] } }
 * );
 *
 * // Apply patches
 * const target = { A: { B: { C: true } } };
 * const patch = { A: { B: { C: false, D: ["Hello"] } } }; // update C, insert D
 *
 * apply(target, patch); // Mutates target
 * ``` */
export const JsonMergePatch: Pretty<typeof _JsonMergePatch> = _JsonMergePatch;
