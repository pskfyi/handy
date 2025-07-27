import type { Json, JsonPointer } from "../mod.ts";
import { add } from "./add.ts";
import { remove } from "./remove.ts";

/** @returns the mutated document, and the value that resided at the destination before the operation, wrapped in an Array */
export function move(
  document: Json.Value,
  destination: JsonPointer.Pointer,
  source: JsonPointer.Pointer,
): [newDoc: Json.Value, replacedVal: Json.Value | undefined] {
  const [d2, value] = remove(document, source);
  const [d3, replaced] = add(d2, destination, value);

  return [d3, replaced];
}
