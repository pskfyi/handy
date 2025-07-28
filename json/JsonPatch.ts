import type { Pretty } from "../ts/types.ts";
import * as _JsonPatch from "./_patch/mod.ts";

/** @module
 *
 * JsonPatch namespace containing utilities and types for working with JSON
 * Patch. */

/** JSON Patch implementation based on [the official
 * spec](https://datatracker.ietf.org/doc/html/rfc6902), and related utilities.
 *
 * ```ts
 * import { JsonPatch } from "path/to/JsonTools/mod.ts";
 * // OR
 * import * as JsonPatch from "path/to/JsonPatch/mod.ts";
 * ```
 *
 * ## Types
 *
 * ```ts
 * // shorthand:
 * //   Value   = Json.Value
 * //   Pointer = JsonPointer.Pointer
 *
 * JsonPatch.AddOp     // { op: "add", path: Pointer, value: Value }
 * JsonPatch.RemoveOp  // { op: "remove", path: Pointer }
 * JsonPatch.ReplaceOp // { op: "replace", path: Pointer, value: Value }
 * JsonPatch.MoveOp    // { op: "move", path: Pointer, from: Pointer }
 * JsonPatch.CopyOp    // { op: "copy", path: Pointer, from: Pointer }
 * JsonPatch.TestOp    // { op: "test", path: Pointer, value: Value }
 *
 * JsonPatch.Operation // union of the above Op types
 * JsonPatch.Patch     // Operation[]
 * JsonPatch.Type      // Patch (alias)
 * ```
 *
 * ### Classes
 *
 * The individual `Operation` types above are defined by classes, which can
 * also be used to create valid `Operation`s succinctly.
 *
 * ```ts
 * new JsonPatch.AddOp(path, value);
 * new JsonPatch.RemoveOp(path);
 * new JsonPatch.ReplaceOp(path, value);
 * new JsonPatch.MoveOp(path, from);
 * new JsonPatch.CopyOp(path, from);
 * new JsonPatch.TestOp(path, value);
 * ```
 *
 * ## Utilities
 *
 * ### `apply(document, patch)`
 *
 * The core utility of this package. Applies a clone of the `patch` to a clone
 * of the `document` if able, then returns the new document.
 *
 * ### `applyOperation(document, operation)`
 *
 * Apply a single `operation` to the `document`. Mutates and returns the
 * `document` if able. Otherwise constructs and returns a new document.
 *
 * ### Operation Functions
 *
 * The individual operation functions. Unlike `apply()`, these functions will
 * will mutate the input document in most circumstances, and their return types
 * are nuanced and complicated. Use with caution.
 *
 * ```ts
 * JsonPatch.add(document, path, value);
 * JsonPatch.remove(document, path);
 * JsonPatch.replace(document, path, value);
 * JsonPatch.move(document, path, from);
 * JsonPatch.copy(document, path, from);
 * JsonPatch.test(document, path, value);
 * ``` */
export const JsonPatch: Pretty<typeof _JsonPatch> = _JsonPatch;
