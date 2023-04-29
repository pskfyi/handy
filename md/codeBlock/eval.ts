import { parse as parseCodeBlock } from "./parse.ts";
import { findAll as findAllCodeBlocks } from "./findAll.ts";
import { CmdResult } from "../../cli/cmd.ts";
import { evaluate as evalTS } from "../../ts/evaluate.ts";

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

type Details = ReturnType<typeof parseCodeBlock>;

function _getCode(
  details: Details,
  replace: Exclude<EvaluateOptions["replace"], undefined>,
) {
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
) {
  const details = parseCodeBlock(codeBlock);
  const code = _getCode(details, replace);

  return await evalTS(code);
}

/** Evaluate each code block within a markdown string, handling each by its
 * language code. Only `ts` is supported now. */
export async function evaluateAll(
  markdown: string,
  { replace = [] }: EvaluateOptions = {},
) {
  const results: Map<
    Details,
    | CmdResult
    | IndentedCodeBlockError
    | NoLanguageError
    | UnknownLanguageError
  > = new Map();

  for (const codeBlock of findAllCodeBlocks(markdown)) {
    const details = parseCodeBlock(codeBlock);

    try {
      const code = _getCode(details, replace);
      const result = await evalTS(code);

      results.set(details, result);
    } catch (error) {
      if (
        error instanceof IndentedCodeBlockError ||
        error instanceof NoLanguageError ||
        error instanceof UnknownLanguageError
      ) {
        results.set(details, error);
      } else {
        results.set(details, new Error("Unknown error", { cause: error }));
      }
    }
  }

  return results;
}
