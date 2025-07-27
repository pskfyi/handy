import type * as JsonTree from "./types.ts";
import { walk } from "./visitors.ts";
import { parentPath } from "./parentPath.ts";
import { assertTree } from "./guards.ts";
import { EdgeTypeError } from "./errors.ts";

function _setChild(
  tree: JsonTree.Tree,
  edge: JsonTree.Edge,
  node: JsonTree.Node,
): JsonTree.Tree {
  const edgeType = typeof edge as "string" | "number";
  const treeIsArray = Array.isArray(tree);

  if (treeIsArray && edgeType === "number") {
    const i = edge as number;
    const diff = i - tree.length;

    if (diff > 0) {
      tree.push(...Array(diff).fill(null));
    }

    tree[i] = node;
  } else if (!treeIsArray && edgeType === "string") {
    tree[edge] = node;
  } else {
    throw new EdgeTypeError(tree, edge);
  }

  return tree;
}

/** Insert or overwrite a descendant in the tree if able. Creates intermediary
 * arrays and objects as needed.
 *
 * If setting the value would create empty entries in an array, those entries
 * are set to null instead.
 *
 * Throws in the following cases:
 * - The path is invalid within the tree
 * - The path points to the root of the tree
 *
 * @returns the mutated input, for convenience */
export function set<T extends JsonTree.Tree>(
  tree: T,
  path: JsonTree.Path,
  node: JsonTree.Node,
): T {
  const _parentPath = parentPath(path);

  if (_parentPath === undefined) {
    throw new Error("JsonTree.set() cannot replace the entire tree.");
  }

  walk(tree, _parentPath, (location) => {
    const isEndOfPath = location.path.length === _parentPath.length;
    const edge = path[location.path.length];
    assertTree(location.node);

    if (isEndOfPath) {
      return _setChild(location.node, edge, node);
    }

    const hasGrandchild = (path.length - location.path.length) >= 2;

    if (hasGrandchild && !(edge in location.node)) {
      const grandchildEdge = path[location.path.length + 1];

      _setChild(
        location.node,
        edge,
        typeof grandchildEdge === "number" ? [] : {},
      );
    }
  });

  return tree;
}
