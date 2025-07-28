import type * as Json from "../types.ts";

/**
 * @module
 *
 * Utility types for JSON Trees. */

/** Numbers should be integers. */
export type Edge = number | string;
export type Path = Edge[];
export type Tree = Json.Array | Json.Object;
export type Node = Json.Value;

export type Location = {
  root: Tree;
  node: Node;
  path: Path;
};
