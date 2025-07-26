import { gray, green, red } from "@std/fmt/colors";

export type Icon = {
  toString: () => string;
  char: string;
  length: number;
};

export const FAILURE: Icon = {
  toString: () => red(FAILURE.char),
  char: "✗",
  length: 1,
};

export const SUCCESS: Icon = {
  toString: () => green(SUCCESS.char),
  char: "✓",
  length: 1,
};
export const SKIP: Icon = {
  toString: () => gray(SKIP.char),
  char: "⊘",
  length: 1,
};
