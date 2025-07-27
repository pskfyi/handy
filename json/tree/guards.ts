import { isValue } from "../utils.ts";
import { TypeAssertionError } from "./errors.ts";
import type * as JsonTree from "./types.ts";

export function isTree(input: unknown): input is JsonTree.Tree {
  const invalid = typeof input !== "object" || input === null ||
    input instanceof Map || input instanceof Set;

  if (invalid) return false;

  if (Array.isArray(input)) {
    return input.every(isValue);
  } else {
    return Object.getOwnPropertySymbols(input).length === 0 &&
      Object.values(input).every(isValue);
  }
}

export function isEdge(input: unknown): input is JsonTree.Edge {
  const type = typeof input;

  return type === "string" ||
    (type === "number" && Number.isSafeInteger(input) &&
      (input as number) >= 0);
}

export function isPath(input: unknown): input is JsonTree.Path {
  return Array.isArray(input) &&
    input.every(isEdge);
}

/**
 * @returns true when passed either an Array + a number, or an Object + a string
 */
export function edgeMatchesTree(
  tree: JsonTree.Tree,
  edge: JsonTree.Edge,
): boolean {
  const edgeType = typeof edge as "string" | "number";

  return Array.isArray(tree) ? edgeType === "number" : edgeType === "string";
}

export function assertTree(
  input: unknown,
): asserts input is JsonTree.Tree {
  if (!isTree(input)) {
    throw new TypeAssertionError(input, "a Json.Object or Json.Array");
  }
}

export function assertEdge(
  input: unknown,
): asserts input is JsonTree.Edge {
  if (!isEdge(input)) {
    throw new TypeAssertionError(input, "a string or non-negative integer");
  }
}

export function assertPath(
  input: unknown,
): asserts input is JsonTree.Path {
  if (!isPath(input)) {
    throw new TypeAssertionError(
      input,
      "an array of strings and/or non-negative integers",
    );
  }
}
