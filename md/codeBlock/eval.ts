import { parse as parseCodeBlock } from "./parse.ts";
import { findAll as findAllCodeBlocks } from "./findAll.ts";
import type { CmdResult } from "../../cli/cmd.ts";
import { evaluate as evalTS } from "../../ts/evaluate.ts";
import { evaluate as evalJS } from "../../js/mod.ts";
import type { CodeBlockDetails } from "./types.ts";
import type { TextLocation } from "../../string/Text.ts";

const LANGS = {
  ts: evalTS,
  js: evalJS,
};

function _isRegistered(lang: string): lang is keyof typeof LANGS {
  return lang in LANGS;
}

export class IndentedCodeBlockError extends Error {
  constructor() {
    super("Indented code blocks are not supported");
    this.name = "IndentedCodeBlockError";
  }
}

export class NoLanguageError extends Error {
  constructor() {
    super("No language specified");
    this.name = "NoLanguageError";
  }
}

export class UnknownLanguageError extends Error {
  constructor(lang: string) {
    super(`Unsupported language: ${lang}`);
    this.name = "UnsupportedLanguageError";
  }
}

export type EvaluateOptions = {
  replace?: [string | RegExp, string][];
};

/** Evaluate a TS or JS code block. Uses `ts/evaluate` and `js/evaluate`. */
export async function evaluate(
  codeBlock: string | CodeBlockDetails,
  { replace = [] }: EvaluateOptions = {},
): Promise<CmdResult> {
  const details = typeof codeBlock === "string"
    ? parseCodeBlock(codeBlock)
    : codeBlock;

  if (details.type === "indented") throw new IndentedCodeBlockError();

  const lang = details.lang;
  let code = details.code;

  if (!lang) throw new NoLanguageError();
  if (!_isRegistered(lang)) throw new UnknownLanguageError(lang);
  for (const [before, after] of replace) code = code.replaceAll(before, after);

  return await LANGS[lang](code);
}

export type EvaluateAllResult = [
  details: CodeBlockDetails,
  location: TextLocation,
  result:
    | IndentedCodeBlockError
    | NoLanguageError
    | UnknownLanguageError
    | Error
    | CmdResult,
];

/** Evaluate each code block within a markdown string, handling each by its
 * language code. Only `ts` is supported now. */
export async function evaluateAll(
  markdown: string,
  { replace = [] }: EvaluateOptions = {},
): Promise<EvaluateAllResult[]> {
  const results: EvaluateAllResult[] = [];

  for (const [details, location] of findAllCodeBlocks(markdown)) {
    try {
      results.push([details, location, await evaluate(details, { replace })]);
    } catch (error) {
      if (
        error instanceof IndentedCodeBlockError ||
        error instanceof NoLanguageError ||
        error instanceof UnknownLanguageError
      ) {
        results.push([details, location, error]);
      } else {
        results.push([
          details,
          location,
          new Error("Unknown error", { cause: error }),
        ]);
      }
    }
  }

  return results;
}
