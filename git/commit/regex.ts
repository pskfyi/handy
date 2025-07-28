/**
 * @module
 *
 * Regex pattern for commit log parsing. */

/** Parses a commit log entry in the format:
 *
 * ```
 * commit <hash>
 * Author: <name> <<email>>
 * Date: <date>
 * <message>
 * ``` */
export const COMMIT_LOG_REGEX: RegExp = new RegExp(
  "commit (?<hash>[0-9a-f]+)\n" +
    "Author: *(?<name>.*) \<(?<email>.*)\>\n" +
    "Date: *(?<date>.*)\n" +
    "(?<message>[\\s\\S]*?)" +
    "(?=\ncommit|$)",
);
