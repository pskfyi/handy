/**
 * @module
 *
 * Fill comment blocks in a markdown string. */

export type FillCommentBlocksOptions = {
  /**
   * @default "start"
   *
   * @example
   * ```md
   * <!-- start my-block -->
   * ``` */
  start?: string;
  /**
   * @default "end"
   *
   * @example
   * ```md
   * <!-- end my-block -->
   * ``` */
  end?: string;
};

/** Fills comment blocks in a markdown string with provided replacements.
 * Inspired by [Markdown Magic](https://github.com/DavidWells/markdown-magic)
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert/equals";
 *
 * const md = `
 *  <!-- start my-block -->
 *  <!-- end my-block -->
 * `;
 *
 * const replacements = {
 *   "my-block": "This is the content for my block."
 * };
 *
 * const filledMd = fillCommentBlocks(md, replacements);
 *
 * const expected = `
 *  <!-- start my-block -->
 *  This is the content for my block.
 *  <!-- end my-block -->
 * `;
 *
 * assertEquals(filledMd, expected); */
export function fillCommentBlocks(
  md: string,
  /** A map of comment block names to the content meant to fill them. */
  replacements: {
    [BlockName: string]: string;
  },
  options?: FillCommentBlocksOptions,
): string {
  for (const [key, value] of Object.entries(replacements)) {
    const start = `<!-- ${options?.start ?? "start"} ${key} -->`;
    const end = `<!-- ${options?.end ?? "end"} ${key} -->`;
    const regex = new RegExp(`${start}.*?${end}`, "gs");

    md = md.replace(regex, `${start}\n${value}\n${end}`);
  }

  return md;
}
