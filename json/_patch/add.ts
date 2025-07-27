import type { Json, JsonPointer, JsonTree } from "../mod.ts";
import { decode } from "../_pointer/encode.ts";
import { at } from "../tree/visitors.ts";
import { EdgeTypeError } from "../tree/errors.ts";
import { assertTree } from "../tree/guards.ts";

/** Insert a value into a JSON document at the specified location, per the
 * official JSON Patch spec. If an existing object property is referenced, it
 * will be overwritten.
 *
 * Throws in the following cases:
 * - The document is `undefined` but the `pointer` points to a child value.
 * - The parent pointer location does not exist in the document.
 * - The parent pointer location exists, but it points to a primitive value.
 * - The final token of the pointer is an array index but the parent value is
 * an object.
 * - The final token of the pointer is an object key but the parent value is
 * an array.
 * - An attempt is made to insert a value into an array at an index which is
 * greater than the array's length.
 *
 * There is a special case for pushing onto an array: if a pointer's final
 * token is exactly `-` (a hyphen, or minus sign) and if the parent location
 * is  an array, the value will be pushed onto the array.
 *
 * @returns the new or mutated document, and the replaced value if one existed, wrapped in an Array */
export function add(
  document: Json.Value | undefined,
  pointer: JsonPointer.Pointer,
  value: Json.Value,
): [newDoc: Json.Value, replacedVal: Json.Value | undefined] {
  if (pointer.length === 0) return [value, document];
  if (document === undefined) {
    throw new Error(
      "JSON Patch add operation can only operate on an undefined document when the pointer refers to the root of the document.",
    );
  }

  const path = decode(pointer);
  const edge = path.pop() as JsonTree.Edge;
  const parentPath = path;

  const replaced = at(document as JsonTree.Tree, parentPath, ({ node }) => {
    assertTree(node);

    const isArray = Array.isArray(node);

    if (isArray && edge === "-") {
      node.push(value);
      return;
    }

    const edgeType = typeof edge as "string" | "number";
    const edgeMatchesTree = isArray
      ? edgeType === "number"
      : edgeType === "string";

    if (!edgeMatchesTree) {
      throw new EdgeTypeError(node, edge);
    }

    let replaced: Json.Value | undefined;

    if (isArray) {
      const _edge = edge as number;
      if (_edge > node.length) {
        throw new Error(
          "JSON Patch add operation cannot insert a value into an array at an index greater than the array's current length",
        );
      }
      node.splice(_edge, 0, value);
    } else {
      replaced = (node as Json.Object)[edge];
      node[edge] = value;
    }

    return replaced;
  });

  return [document, replaced];
}
