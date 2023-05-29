import { splitOnFirst } from "../../string/splitOn.ts";

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

/* See https://spec.commonmark.org/0.30/#info-string */
export function parse(infoString: string): Info {
  if (!infoString) return {};

  const [lang, meta] = splitOnFirst(" ", infoString);

  return { lang, meta };
}
