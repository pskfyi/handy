import type * as JsonPatch from "./types.ts";
import type * as Json from "../types.ts";
import { add } from "./add.ts";
import { replace } from "./replace.ts";
import { test } from "./test.ts";
import { move } from "./move.ts";
import { copy } from "./copy.ts";
import { remove } from "./remove.ts";

/** Applies a single JsonPatch.Operation to a document. */
export function applyOperation(
  document: Json.Value | undefined,
  operation: JsonPatch.Operation,
): Json.Value | undefined {
  if (document === undefined) {
    if (operation.op === "add" || operation.op === "replace") {
      document = null;
    } else {
      throw new Error(
        "JSON Patch can only operate on an undefined document when the " +
          "operation is an add or replace.",
      );
    }
  }

  const result = operation.op === "add"
    ? add(document, operation.path, operation.value)
    : operation.op === "replace"
    ? replace(document, operation.path, operation.value)
    : operation.op === "test"
    ? test(document, operation.path, operation.value)
    : operation.op === "remove"
    ? remove(document, operation.path)
    : operation.op === "copy"
    ? copy(document, operation.path, operation.from)
    : move(document, operation.path, operation.from);

  return result[0];
}
