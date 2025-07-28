import type * as JsonTree from "./types.ts";
import { at } from "./visitors.ts";

/**
 * @module
 *
 * Get a node from a JSON tree. */

/** Retrieve a node from a tree.
 *
 * Throws in the following cases:
 * - A node does not exist at the given path
 * - The path is invalid within the tree */
export function get(
  tree: JsonTree.Tree,
  path: JsonTree.Path,
): JsonTree.Node {
  return at(tree, path, ({ node }) => node);
}
