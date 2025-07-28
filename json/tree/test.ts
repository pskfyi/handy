import type * as JsonTree from "./types.ts";
import { get } from "./get.ts";
import { equals } from "../utils.ts";

/** @module
 *
 * Confirming the existence of nodes in a JSON tree. */

/** Confirm if a node exists at a path in a tree. Checks for deep structural
 * equality using `Json.equals()`. */
export function test(
  tree: JsonTree.Tree,
  path: JsonTree.Path,
  node: JsonTree.Node,
): boolean {
  try {
    const result = get(tree, path);

    return result !== undefined && equals(result, node);
  } catch {
    return false;
  }
}
