import type * as JsonTree from "./types.ts";

/** @returns the parent path, or `undefined` if the given path was empty */
export function parentPath(path: JsonTree.Path): JsonTree.Path | undefined {
  return path.length === 0 ? undefined : path.slice(0, path.length - 1);
}
