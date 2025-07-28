import { set } from "./set.ts";
import type * as JsonTree from "./types.ts";
import { crawlLeaves } from "./visitors.ts";

/**
 * @module
 *
 * Like Object.entries except the keys are Paths. */

/** Translates a tree into a collection of Path & leaf Node pairs. */
export function entries(
  tree: JsonTree.Tree,
): Array<[JsonTree.Path, JsonTree.Node]> {
  const entries: Array<[JsonTree.Path, JsonTree.Node]> = [];

  crawlLeaves(tree, ({ path, node }) => {
    entries.push([path, node]);
  });

  return entries;
}

/**
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert/equals";
 *
 * const tree = JsonTree.fromEntries([
 *   [["a", "b"], 1],
 *   [["a", "c"], 2],
 *   [["d"], 3],
 * ]);
 *
 * assertEquals(tree, {
 *   a: {
 *     b: 1,
 *     c: 2,
 *   },
 *   d: 3,
 * });
 * ``` */
export function fromEntries(
  entries: Array<[JsonTree.Path, JsonTree.Node]>,
): JsonTree.Tree {
  if (!entries.length) {
    throw new Error("JsonTree.fromEntries() requires at least one entry");
  }

  const firstEntry = entries[0];
  const firstEntryPath = firstEntry[0];
  const firstEntryPathEdge = firstEntryPath[0];
  const treeIsArray = typeof firstEntryPathEdge === "number";

  const tree: JsonTree.Tree = treeIsArray ? [] : {};

  entries.forEach(([path, node]) => set(tree, path, node));

  return tree;
}
