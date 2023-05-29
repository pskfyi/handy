import { parse as parseCodeBlock } from "./parse.ts";
import { findAll as findAllCodeBlocks } from "./findAll.ts";
import type { CmdResult } from "../../cli/cmd.ts";
import { evaluate as evalTS } from "../../ts/evaluate.ts";
import type { CodeBlockDetails } from "./types.ts";
import type { TextLocation } from "../../string/Text.ts";

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

function _getCode(
  details: CodeBlockDetails,
  replace: Exclude<EvaluateOptions["replace"], undefined>,
): string {
  if (details.type === "indented") throw new IndentedCodeBlockError();

  const { lang, code } = details;

  if (!lang) throw new NoLanguageError();

  if (lang !== "ts") throw new UnknownLanguageError(lang);

  return replace.reduce(
    (code, [search, replace]) => code.replaceAll(search, replace),
    code,
  );
}

/** Passes a code block to `deno eval`. */
export async function evaluate(
  codeBlock: string,
  { replace = [] }: EvaluateOptions = {},
): Promise<CmdResult> {
  const details = parseCodeBlock(codeBlock);
  const code = _getCode(details, replace);

  return await evalTS(code);
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
      const code = _getCode(details, replace);

      results.push([details, location, await evalTS(code)]);
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
