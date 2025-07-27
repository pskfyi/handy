import type { ChildPointer, Pointer, RootPointer } from "./types.ts";

/**
 * @returns the parent pointer, or `undefined` if the input was `""`
 *
 * @example parent("/foo/bar/baz") // "/foo/bar" */
export function parent(input: RootPointer): undefined;
export function parent(input: ChildPointer): Pointer;
export function parent(input: Pointer): Pointer | undefined;
export function parent(input: Pointer): Pointer | undefined {
  if (input === "") return undefined;

  const lastSlashIndex = input.lastIndexOf("/");

  return lastSlashIndex === -1 ? "" : input.slice(0, lastSlashIndex) as Pointer;
}
