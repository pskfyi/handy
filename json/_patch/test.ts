import type { Json, JsonPointer, JsonTree } from "../mod.ts";
import { decode } from "../_pointer/encode.ts";
import { get as getPath } from "../tree/get.ts";
import { PrettyError } from "../errors.ts";
import { equals } from "../utils.ts";

/** @returns the input document wrapped in an Array, for parity with other operations */
export function test(
  document: Json.Value,
  pointer: JsonPointer.Pointer,
  value: Json.Value,
): [newDoc: Json.Value] {
  const path = decode(pointer);
  const source = getPath(document as JsonTree.Tree, path);
  const valid = equals(value, source);

  if (!valid) {
    throw new PrettyError(
      `JSON Patch test operation failed.`,
      { expected: value, received: source },
    );
  }

  return [document];
}
