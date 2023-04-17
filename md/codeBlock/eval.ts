import { parse as parseCodeBlock } from "./parse.ts";
import { findAll as findAllCodeBlocks } from "./findAll.ts";

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

export type EvaluateResult = {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
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

async function _eval(code: string) {
  const process = Deno.run({
    cmd: ["deno", "eval", "--check", "--ext=ts", code],
    stdout: "piped",
    stderr: "piped",
  });

  const status = await process.status();
  const stdout = new TextDecoder().decode(await process.output());
  const stderr = new TextDecoder().decode(await process.stderrOutput());

  process.close();

  const { success, code: exitCode } = status;

  return { success, exitCode, stdout, stderr };
}

/** Passes a code block to `deno eval`. */
export async function evaluate(
  codeBlock: string,
  { replace = [] }: EvaluateOptions = {},
): Promise<EvaluateResult> {
  const details = parseCodeBlock(codeBlock);
  const code = _getCode(details, replace);

  return await _eval(code);
}

/** Evaluate each code block within a markdown string, handling each by its
 * language code. Only `ts` is supported now. */
export async function evaluateAll(
  markdown: string,
  { replace = [] }: EvaluateOptions = {},
) {
  const results: Map<
    Details,
    | EvaluateResult
    | IndentedCodeBlockError
    | NoLanguageError
    | UnknownLanguageError
  > = new Map();

  for (const codeBlock of findAllCodeBlocks(markdown)) {
    const details = parseCodeBlock(codeBlock);

    try {
      const code = _getCode(details, replace);
      const result = await _eval(code);

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
