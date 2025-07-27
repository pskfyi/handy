import type { Json, JsonPointer, JsonTree } from "../mod.ts";
import { decode } from "../_pointer/encode.ts";
import { remove as removePath } from "../tree/remove.ts";

/** @returns the mutated document, and the value that resided at the destination before the operation, wrapped in an Array */
export function remove(
  document: Json.Value,
  pointer: JsonPointer.Pointer,
): [newDoc: Json.Value | undefined, replacedVal: Json.Value] {
  if (pointer.length === 0) return [undefined, document];

  const removed = removePath(document as JsonTree.Tree, decode(pointer));

  return [document, removed];
}
