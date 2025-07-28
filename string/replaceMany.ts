/**
 * @module
 *
 * Replacing multiple substrings in a string. */

/** For each key/value pair in `replacements`, replaces all occurrences of
 * the key in `input` with the value. */
export function replaceMany(
  input: string,
  replacements: Record<string, string>,
  options?: {
    /** @default true */
    caseSensitive?: boolean;
  },
): string {
  let output = input;

  const { caseSensitive = true } = options ?? {};

  for (const [find, replace] of Object.entries(replacements)) {
    output = output.replace(
      new RegExp(find, caseSensitive ? "g" : "gi"),
      replace,
    );
  }

  return output;
}
