import { RegExpParser } from "./RegExpParser.ts";

/**
 * @module
 *
 * A parser for regular expressions. */

/** Matches against the given regular expressions in order.
 *
 * Patterns are expected to match the start of the string and will throw
 * otherwise. Consider adding `^` to the start of your patterns.
 *
 * @example
 * const parser = regexp(/\d{3}-\d{3}-\d{4}/).match;
 * parser.parse("123-456-7890"); // "123-456-7890" */
export function regexp(...patterns: RegExp[]): RegExpParser {
  return RegExpParser.fromPatterns(patterns);
}
