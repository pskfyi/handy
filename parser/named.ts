import { Parser } from "./Parser.ts";
import { regexp } from "./regexp.ts";

/** Matches an empty string. */
export const end = regexp(/^$/).ignore
  .named("end");

/** Matches `\r`, `\n`, or `\r\n`. */
export const newline = regexp(/^(\r?\n|\r)/m).match
  .named("newline");

/** Matches whitespace that's not a newline. */
export const inlineWhitespace = regexp(/^[ \t\v]+/).match
  .named("inlineWhitespace");

/** Matches one or more whitespace characters. */
export const whitespace = regexp(/^\s+/).match
  .named("whitespace") as Parser<string> & {
    /** Matches whitespace that's not a newline. */
    inline: Parser<string>;
  };

whitespace.inline = inlineWhitespace;

/** Matches a line that's all whitespace. */
export const blankLine = regexp(/^[ \t\v]*(\r?\n|\r|$)/).match
  .named("blankLine");

/** Matches a line that's not all whitespace. */
export const nonBlankLine = regexp(/^[^\r\n]*?\S.*?(\r?\n|\r|$)/m).match
  .named("nonBlankLine");

/** Matches a line that has no non-newline characters. */
export const emptyLine = regexp(/^(\r?\n|\r|$)/).match
  .named("emptyLine");

/** Matches a line that has at least one non-newline character. */
export const nonEmptyLine = regexp(/^[^\r\n]+?(\r?\n|\r|$)/m).match
  .named("nonBlankLine");

/** The remainder of a line until a newline sequence or end of string. */
export const line = regexp(/^[^\r\n]*?(\r?\n|\r|$)/m).match
  .named("line") as Parser<string> & {
    /** Matches a line that's all whitespace. */
    blank: Parser<string>;
    /** Matches a line that's not all whitespace. */
    nonBlank: Parser<string>;
    /** Matches a line that has no non-newline characters. */
    empty: Parser<string>;
    /** Matches a line that has at least one non-newline character. */
    nonEmpty: Parser<string>;
  };

line.blank = blankLine;
line.nonBlank = nonBlankLine;
line.empty = emptyLine;
line.nonEmpty = nonEmptyLine;
