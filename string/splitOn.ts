/**
 * @module
 *
 * Utilities for splitting strings. */

/** @example splitOnFirst("--", "foo--bar--baz") // ["foo", "bar--baz"] */
export function splitOnFirst(sep: string, str: string): [string, string] {
  if (!str || !sep) return [str, ""];

  const index = str.indexOf(sep);

  if (index === -1) return [str, ""];

  return [str.slice(0, index), str.slice(index + sep.length)];
}

/** @example splitOn(2, "/", "a/b/c/d") // ["a", "b", "c/d"] */
export function splitOn(
  count: number,
  sep: string,
  str: string,
): string[] {
  if (!count || !str || !sep) return [str];

  const result: string[] = [];

  let i = 0;
  let start = 0;

  while (i < count) {
    const index = str.indexOf(sep, start);

    if (index === -1) break;

    result.push(str.slice(start, index));

    start = index + sep.length;
    i++;
  }

  result.push(str.slice(start));

  return result;
}
