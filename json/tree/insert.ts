import type * as JsonTree from "./types.ts";
import { walk } from "./visitors.ts";
import { parentPath } from "./parentPath.ts";
import { assertTree } from "./guards.ts";
import { EdgeTypeError } from "./errors.ts";
import { PrettyError } from "../errors.ts";

/** @module
 *
 * Inserting nodes into a JSON tree. */

class ValueExistsError extends PrettyError {
  constructor(tree: JsonTree.Tree, edge: JsonTree.Edge) {
    super("A node already exists in the tree along this edge:", {
      edge,
      tree,
    });
  }
}

function _insertChild(
  tree: JsonTree.Tree,
  edge: JsonTree.Edge,
  node: JsonTree.Node,
): JsonTree.Tree {
  if (edge in tree) {
    throw new ValueExistsError(tree, edge);
  }

  const edgeType = typeof edge as "string" | "number";
  const isArray = Array.isArray(tree);

  if (isArray && edgeType === "number") {
    const i = edge as number;
    const diff = i - tree.length;

    if (diff > 0) {
      tree.push(...Array(diff).fill(null));
    }

    tree[i] = node;
  } else if (!isArray && edgeType === "string") {
    tree[edge] = node;
  } else {
    throw new EdgeTypeError(tree, edge);
  }

  return tree;
}

/**
 * Insert a node into a tree. Will not overwrite an existing node. Creates
 * intermediary array and object nodes as needed.
 *
 * If this operation would create empty entries in an array, those entries are
 * set to `null` instead.
 *
 * Throws in the following cases:
 * - A node already exists at the given path
 * - The path is invalid within the tree
 * - The path points to the root of the tree
 *
 * @returns the mutated input, for convenience
 */
export function insert<T extends JsonTree.Tree>(
  tree: T,
  path: JsonTree.Path,
  node: JsonTree.Node,
): T {
  const _parentPath = parentPath(path);

  if (_parentPath === undefined) {
    throw new Error(
      "JsonTree.insert() cannot replace the entire tree.",
    );
  }

  walk(tree, _parentPath, (location) => {
    const isEndOfPath = location.path.length === _parentPath.length;
    const edge = path[location.path.length];
    assertTree(location.node);

    if (isEndOfPath) {
      return _insertChild(location.node, edge, node);
    }

    const hasGrandchild = (path.length - location.path.length) >= 2;

    if (hasGrandchild && !(edge in location.node)) {
      const grandchildEdge = path[location.path.length + 1];

      _insertChild(
        location.node,
        edge,
        typeof grandchildEdge === "number" ? [] : {},
      );
    }
  });

  return tree;
}
