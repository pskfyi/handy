export const FENCED_CODE_BLOCK_REGEX = new RegExp(
  "^(?<fence>`{3,}|~{3,})" +
    "(?<infoString>[^\n]*)\n" +
    "((?<code>[\\s\\S]*?)\n)?" +
    "\\k<fence>",
);

export const INDENTED_CODE_BLOCK_REGEX = new RegExp(
  "^ {4,}[^\n]+(\n" + // first line, w/ optional trailing newline
    "(\n|^ {4,}.*\n)*" + // ... subsequent lines
    "^ {4,}[^\n]+)?", // ... and final line, closing w/ )?
  "gm",
);

export const CODE_BLOCK_REGEX = new RegExp(
  `^((${INDENTED_CODE_BLOCK_REGEX.source})|(${FENCED_CODE_BLOCK_REGEX.source}))`,
  "gm",
);
