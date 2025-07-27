import type { Json, JsonPointer, JsonTree } from "../mod.ts";
import { decode } from "../_pointer/encode.ts";
import { assertTree, edgeMatchesTree } from "../tree/guards.ts";
import { at } from "../tree/visitors.ts";
import { EdgeTypeError } from "../tree/errors.ts";

/** Replace a value in a JSON document at the specified location. Throws if a
 * value does not exist at the pointer location.
 *
 * @returns the new or mutated document, and the replaced value, wrapped in an Array */
export function replace(
  document: Json.Value | undefined,
  pointer: JsonPointer.Pointer,
  value: Json.Value,
): [newDoc: Json.Value, replacedVal: Json.Value | undefined] {
  if (pointer.length === 0) return [value, document];
  if (document === undefined) {
    throw new Error(
      "JSON Patch replace operation can only operate on an undefined document when the pointer refers to the root of the document.",
    );
  }

  const path = decode(pointer);
  const edge = path.pop() as JsonTree.Edge;
  const parentPath = path;

  const replaced = at(document as JsonTree.Tree, parentPath, ({ node }) => {
    assertTree(node);

    if (!edgeMatchesTree(node, edge)) throw new EdgeTypeError(node, edge);

    const replaced = (node as Json.Object)[edge];
    if (replaced === undefined) {
      throw new Error(
        "JSON Patch replace operation requires that a value exists at the pointer location, but no value was found.",
      );
    }

    (node as Json.Object)[edge] = value;

    return replaced;
  });

  return [document, replaced];
}
