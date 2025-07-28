import { regexp } from "../../parser/regexp.ts";
import { line } from "../../parser/named.ts";
import type { Parser } from "../../parser/Parser.ts";

/**
 * @module
 *
 * Metadata attached to the first line of a fenced markdown code block. */

export class InfoStringError extends TypeError {
  constructor(infoString: string) {
    super(`Info string cannot include newlines: ${infoString}`);
    this.name = "InfoStringError";
  }
}

export class LanguageError extends TypeError {
  constructor(lang: string) {
    super(`Language cannot include whitespace: ${lang}`);
    this.name = "LanguageError";
  }
}

export type Info = {
  /** Automatically converted to lowercase.
   *
   * @throws {LanguageError} if `lang` contains whitespace
   *
   * @example create("let a: number = 1;", { lang: "ts" }) */
  lang?: string;
  /** Additional text to include after the language code. Automatically trimmed.
   *
   * See https://spec.commonmark.org/0.30/#info-string
   *
   * If `lang` is not provided, `"nocode"` will be used as the `lang`. This is
   * to prevent the codeblock from being highlighted as a language, and to
   * ensure that the full infoString starts with a language code for parsers.
   * To override this behavior, provide an empty `lang` (`""`).
   *
   * @throws {InfoStringError} if `info` contains newlines
   *
   * @example
   * create("const a = 1;", "ts", "some info for a markdown parser") */
  meta?: string;
};

/* See https://spec.commonmark.org/0.30/#info-string */
export function stringify({ lang, meta }: Info = {}): string {
  if (meta?.includes("\n")) throw new InfoStringError(meta);
  if (lang && /\s/.test(lang)) throw new LanguageError(lang);

  lang = lang?.toLowerCase();
  meta = meta?.trim();

  return lang && meta
    ? `${lang} ${meta}`
    : meta && lang === undefined
    ? `nocode ${meta}`
    : meta && lang === ""
    ? meta
    : lang || "";
}

const lang = regexp(/^\S+/).match; // one or more non-whitespace characters
const meta = line; // the rest of the line

export const parser: Parser<Info> = lang.optional.and(meta.optional)
  .into(([lang, meta]) => {
    const info: Info = {};
    meta = meta?.trim();

    if (lang) info.lang = lang;
    if (meta) info.meta = meta;

    return info;
  })
  .named("md.codeBlock.infoString");

/* See https://spec.commonmark.org/0.30/#info-string */
export function parse(infoString: string): Info {
  return parser.parse(infoString)[0];
}
