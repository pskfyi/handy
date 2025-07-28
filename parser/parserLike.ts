import type { Parser } from "./Parser.ts";
import type { CoreParser } from "./core.ts";
import { regexp } from "./regexp.ts";
import { string } from "./string.ts";

/** @module
 *
 * Utils for casting data types to parsers. */

export type ParserLike = CoreParser | string | RegExp;

export type AsParser<T extends ParserLike> = //
  T extends string ? Parser<T>
    : T extends RegExp ? Parser<string>
    : T extends CoreParser ? T
    : never;

export type AsParsers<T extends ParserLike[]> = {
  [K in keyof T]: AsParser<T[K]>;
};

export function asParser<T extends ParserLike>(parserLike: T): AsParser<T> {
  return (typeof parserLike === "string"
    ? string(parserLike)
    : parserLike instanceof RegExp
    ? regexp(parserLike).match
    : parserLike) as AsParser<T>;
}

export function asParsers<T extends ParserLike[]>(
  ...parserLikes: T
): AsParsers<T> {
  return parserLikes.map(asParser) as AsParsers<T>;
}
