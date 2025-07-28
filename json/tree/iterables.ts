import type * as JsonTree from "./types.ts";
import { isTree } from "./guards.ts";
import { PrimitiveError } from "./errors.ts";
import { _getChild } from "./_getChild.ts";

/**
 * @module
 *
 * Utils for traversing a JSON tree. */

/** Construct an iterator that crawls through a tree's children depth-first. */
export function childCrawler(
  root: JsonTree.Tree,
): Iterable<JsonTree.Location> {
  return {
    *[Symbol.iterator]() {
      const edges = Array.isArray(root)
        ? root.map((_v, i) => i)
        : Object.keys(root);

      for (const edge of edges) {
        const node = _getChild(root, edge);

        yield { root, node, path: [edge] };

        if (isTree(node)) {
          for (const location of childCrawler(node)) {
            yield {
              root,
              node: location.node,
              path: [edge, ...location.path],
            };
          }
        }
      }
    },
  };
}

/** Construct an iterator that crawls through a tree's leaves depth-first. */
export function leafCrawler(
  root: JsonTree.Tree,
): Iterable<JsonTree.Location> {
  return {
    *[Symbol.iterator]() {
      const edges = Array.isArray(root)
        ? root.map((_v, i) => i)
        : Object.keys(root);

      if (!edges.length) {
        yield { root, node: root, path: [] };
      }

      for (const edge of edges) {
        const node = _getChild(root, edge);
        const nodeIsTree = isTree(node);

        if (nodeIsTree) {
          for (const location of leafCrawler(node)) {
            yield {
              root,
              node: location.node,
              path: [edge, ...location.path],
            };
          }
        } else {
          yield { root, node, path: [edge] };
        }
      }
    },
  };
}

/** Construct an iterator that crawls through a tree depth-first. */
export function crawler(
  root: JsonTree.Tree,
): Iterable<JsonTree.Location> {
  return {
    *[Symbol.iterator]() {
      yield { root, node: root, path: [] };

      for (const location of childCrawler(root)) {
        yield location;
      }
    },
  };
}

/** Construct an iterator that walks a path through a tree, skipping the root
 * node. */
export function childWalker(
  root: JsonTree.Tree,
  path: JsonTree.Path,
): Iterable<JsonTree.Location> {
  return {
    *[Symbol.iterator]() {
      let intermediateTree: JsonTree.Tree = root;
      let currentPath: JsonTree.Path = [];
      let node: JsonTree.Node;

      for (const edge of path) {
        node = _getChild(intermediateTree, edge);
        currentPath = [...currentPath, edge];

        yield { root, node, path: currentPath };

        const isLast = currentPath.length === path.length;
        if (isLast) break;

        if (!isTree(node)) throw new PrimitiveError(node, edge);
        intermediateTree = node;
      }
    },
  };
}

/** Construct an iterator that walks a path through a tree. */
export function walker(
  root: JsonTree.Tree,
  path: JsonTree.Path,
): Iterable<JsonTree.Location> {
  return {
    *[Symbol.iterator]() {
      yield { root, node: root, path: [] };

      for (const location of childWalker(root, path)) {
        yield location;
      }
    },
  };
}
