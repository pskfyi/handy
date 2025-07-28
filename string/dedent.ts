/**
 * @module
 *
 * A utility for working with string indentation. */

/** Remove indentation from a string. */
export function dedent(
  str: string,
  options?: { char?: string; returnIndentation?: false },
): string;
export function dedent(
  str: string,
  options: {
    char?: string;
    returnIndentation: true;
  },
): [code: string, indentation: string];
export function dedent(
  str: string,
  { char = " ", returnIndentation = false } = {},
): string | [code: string, indentation: string] {
  if (str.length === 0) return returnIndentation ? ["", ""] : "";

  if (char.length !== 1) throw new Error("char must be a single character");
  const _char = char === " "
    ? " "
    : char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const lines = str.split("\n");
  const regex = new RegExp(`^${_char}+`);
  const indent = Math.min(
    ...lines
      .filter((line) => line.replace(regex, "").length)
      .map((line) => line.match(regex)?.[0].length || 0),
  );

  const code = lines.map((line) => line.slice(indent)).join("\n");

  return returnIndentation ? [code, char.repeat(indent)] : code;
}
