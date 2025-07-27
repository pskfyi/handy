import type * as JsonPatch from "./types.ts";
import type * as Json from "../types.ts";
import { applyOperation } from "./applyOperation.ts";

/**
 * Clones the `document` and applies a sequence of `JsonPatch.Operations` to the
 * clone. Throws if any operation is unsuccessful.
 *
 * The `patch` is also cloned to avoid situations where an object created by
 * one operation would be mutated by a subsequent operation.
 *
 * @returns the cloned document.
 */
export function apply(
  document: Json.Value,
  patch: JsonPatch.Patch,
): Json.Value | undefined {
  let doc: Json.Value | undefined = JSON.parse(JSON.stringify(document));
  const _patch = JSON.parse(JSON.stringify(patch)) as JsonPatch.Patch;

  _patch.forEach((operation) => {
    doc = applyOperation(doc, operation);
  });

  return doc;
}
