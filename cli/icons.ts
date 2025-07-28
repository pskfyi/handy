import { gray, green, red } from "@std/fmt/colors";

/**
 * @module
 *
 * Colored unicode icons used in CLI output. */

/** Shape of a CLI icon. */
export type Icon = {
  toString: () => string;
  char: string;
  length: number;
};

/** A red ✗ icon. */
export const FAILURE: Icon = {
  toString: () => red(FAILURE.char),
  char: "✗",
  length: 1,
};

/** A green ✓ icon. */
export const SUCCESS: Icon = {
  toString: () => green(SUCCESS.char),
  char: "✓",
  length: 1,
};

/** A gray ⊘ icon. */
export const SKIP: Icon = {
  toString: () => gray(SKIP.char),
  char: "⊘",
  length: 1,
};
