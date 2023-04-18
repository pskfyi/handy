export const COMMIT_LOG_REGEX = new RegExp(
  "commit (?<hash>[0-9a-f]+)\n" +
    "Author: *(?<name>.*) \<(?<email>.*)\>\n" +
    "Date: *(?<date>.*)\n" +
    "(?<message>[\\s\\S]*?)" +
    "(?=\ncommit|$)",
);
