import { set } from "./set.ts";
import type * as JsonTree from "./types.ts";
import { crawlLeaves } from "./visitors.ts";

/** Translates a tree into a map from Paths to leaf Nodes. */
export function map(tree: JsonTree.Tree): Map<JsonTree.Path, JsonTree.Node> {
  const pathMap = new Map<JsonTree.Path, JsonTree.Node>();

  crawlLeaves(tree, ({ path, node }) => {
    pathMap.set(path, node);
  });

  return pathMap;
}

export function fromMap(
  map: Map<JsonTree.Path, JsonTree.Node>,
): JsonTree.Tree {
  if (!map.size) {
    throw new Error("JsonTree.fromEntries() requires at least one entry");
  }

  const entries = [...map.entries()];

  const firstEntry = entries[0];
  const firstEntryPath = firstEntry[0];
  const firstEntryPathEdge = firstEntryPath[0];
  const treeIsArray = typeof firstEntryPathEdge === "number";

  const tree: JsonTree.Tree = treeIsArray ? [] : {};

  entries.forEach(([path, node]) => set(tree, path, node));

  return tree;
}
