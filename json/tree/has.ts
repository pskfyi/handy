import type * as JsonTree from "./types.ts";
import { get } from "./get.ts";

/** Confirm if a node exists at a path within a tree. */
export function has(
  tree: JsonTree.Tree,
  path: JsonTree.Path,
): boolean {
  try {
    return get(tree, path) !== undefined;
  } catch {
    return false;
  }
}
