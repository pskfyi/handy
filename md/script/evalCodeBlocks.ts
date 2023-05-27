import { gray, green, red } from "../../_deps/fmt.ts";
import { CmdResult } from "../../cli/cmd.ts";
import { consoleWidth } from "../../cli/consoleSize.ts";
import {
  evaluateAll,
  EvaluateOptions,
  IndentedCodeBlockError,
  NoLanguageError,
  UnknownLanguageError,
} from "../codeBlock/eval.ts";
import { CodeBlockDetails } from "../codeBlock/types.ts";

export async function evalCodeBlocks(
  filePath: string,
  replace?: EvaluateOptions["replace"],
): Promise<
  Map<
    CodeBlockDetails,
    | IndentedCodeBlockError
    | NoLanguageError
    | UnknownLanguageError
    | CmdResult
  >
> {
  const markdown = await Deno.readTextFile(filePath);
  console.log(`Executing code blocks in ${filePath}`);

  const width = consoleWidth(80);
  console.log("-".repeat(width));

  const results = await evaluateAll(markdown, { replace });

  for (const [details, result] of results) {
    if (details.type === "indented") continue;
    if (details.lang === "no-eval") continue;

    const metaArgs = (details.meta ?? "").split(/ +/);
    if (metaArgs.includes("no-eval")) continue;

    const { lang, code } = details;

    const icon = (result instanceof NoLanguageError ||
        result instanceof UnknownLanguageError)
      ? "skip"
      : (result instanceof Error || !result.success)
      ? "✗"
      : "✔️";

    const colorIcon = icon === "✗"
      ? red(icon)
      : icon === "✔️"
      ? green(icon)
      : gray(icon);

    const iconLength = icon === "skip" ? 4 : 1;
    const langLength = String(lang).length;

    const inlineCode = code.trim().replace(/\s+/g, " ");
    const firstChars = inlineCode.slice(
      0,
      width - langLength - iconLength - 5,
    );

    const message = firstChars.length < inlineCode.length
      ? `${colorIcon} ${details.lang} ${firstChars}...`
      : `${colorIcon} ${details.lang} ${firstChars}`;

    console.log(message);
  }

  return results;
}

if (import.meta.main) {
  const [filePath, search, _replace] = Deno.args;

  if (!filePath) {
    console.error("Please provide a file path");
    Deno.exit(1);
  }

  const replace = (search && _replace)
    ? [[search, _replace]] as [string, string][]
    : undefined;

  const results = await evalCodeBlocks(filePath, replace);

  results.forEach((result) => {
    if (!(result instanceof Error) && !result.success) Deno.exit(1);
  });
}
