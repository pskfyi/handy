import type * as Json from "../types.ts";
import { EdgeNotFoundError, EdgeTypeError } from "./errors.ts";
import { edgeMatchesTree } from "./guards.ts";
import type * as JsonTree from "./types.ts";

/** @private */
export function _getChild(
  tree: JsonTree.Tree,
  edge: JsonTree.Edge,
): JsonTree.Node {
  if (!(edge in tree)) throw new EdgeNotFoundError(tree, edge);
  if (!edgeMatchesTree(tree, edge)) throw new EdgeTypeError(tree, edge);

  return (tree as Json.Object)[edge]!;
}
