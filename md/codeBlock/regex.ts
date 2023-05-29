export const FENCED_CODE_BLOCK_REGEX = new RegExp(
  "^(?<fence>`{3,}|~{3,})" +
    "(?<infoString>[^\r\n]*)\r?\n" +
    "((?<code>[\\s\\S]*?)\r?\n)?" +
    "\\k<fence>",
);

export const INDENTED_CODE_BLOCK_REGEX = new RegExp(
  "^ {4,}[^\r\n]+(\r?\n" + // first line, w/ optional trailing newline
    "(\r?\n|^ {4,}.*\r?\n)*" + // ... subsequent lines
    "^ {4,}[^\r\n]+)?", // ... and final line, closing w/ )?
  "gm",
);
