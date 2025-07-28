import type * as JsonTree from "./types.ts";
import type * as Json from "../types.ts";
import { at } from "./visitors.ts";
import { parentPath } from "./parentPath.ts";
import { EdgeNotFoundError, EdgeTypeError, PrimitiveError } from "./errors.ts";

/**
 * @module
 *
 * Removing nodes from a JSON tree. */

function _removeChild(
  tree: JsonTree.Tree,
  edge: JsonTree.Edge,
): JsonTree.Node {
  if (!(edge in tree)) throw new EdgeNotFoundError(tree, edge);

  const edgeType = typeof edge as "string" | "number";
  const isArray = Array.isArray(tree);

  const edgeMatchesTree = isArray
    ? edgeType === "number"
    : edgeType === "string";

  if (!edgeMatchesTree) throw new EdgeTypeError(tree, edge);

  const node = (tree as Json.Object)[edge]!;

  if (isArray) {
    tree.splice(edge as number, 1);
  } else {
    delete tree[edge];
  }

  return node;
}

/**
 * Remove a node from a tree.
 *
 * Throws in the following cases:
 * - A node does not exist at the given path
 * - The path is invalid within the tree
 * - The path points to the root of the tree
 *
 * @returns the removed node
 */
export function remove<T extends JsonTree.Tree>(
  tree: T,
  path: JsonTree.Path,
): JsonTree.Node {
  const _parentPath = parentPath(path);

  if (_parentPath === undefined) {
    throw new Error(
      "JsonTree.remove() cannot replace the entire tree.",
    );
  }

  return at(tree, _parentPath, ({ node: target }) => {
    const edge = path[path.length - 1];
    if (typeof target !== "object" || target === null) {
      throw new PrimitiveError(target, edge);
    }
    return _removeChild(target, edge);
  });
}
