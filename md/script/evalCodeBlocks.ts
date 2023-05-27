import { gray, green, red } from "../../_deps/fmt.ts";
import { CmdResult } from "../../cli/cmd.ts";
import {
  evaluateAll,
  EvaluateOptions,
  IndentedCodeBlockError,
  NoLanguageError,
  UnknownLanguageError,
} from "../codeBlock/eval.ts";
import { CodeBlockDetails, TextLocation } from "../codeBlock/types.ts";

export async function evalCodeBlocks(
  filePath: string,
  replace?: EvaluateOptions["replace"],
): Promise<
  Map<
    CodeBlockDetails,
    [
      TextLocation,
      | IndentedCodeBlockError
      | NoLanguageError
      | UnknownLanguageError
      | CmdResult,
    ]
  >
> {
  const markdown = await Deno.readTextFile(filePath);
  console.log(`Executing code blocks in ${filePath}`);

  const consoleWidth = Deno.isatty(Deno.stdout.rid)
    ? Deno.consoleSize().columns
    : 80;
  console.log("-".repeat(consoleWidth));

  const results = await evaluateAll(markdown, { replace });

  for (const [details, resultArr] of results) {
    if (details.type === "indented") continue;
    if (details.lang === "no-eval") continue;

    const metaArgs = (details.meta ?? "").split(/ +/);
    if (metaArgs.includes("no-eval")) continue;

    const { lang, code } = details;
    const [location, result] = resultArr;

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

    const inlineCode = code.trim().replace(/\s+/g, " ");

    const message = `${colorIcon} ${lang} ${inlineCode}`;

    const extraSpace = 10;

    const firstChars = (message.length <= consoleWidth)
      ? message
      : message.slice(0, consoleWidth + extraSpace - 3) + "...";

    console.log(firstChars);
    if (result instanceof Error || !result.success) {
      const source = `${
        red("→")
      } error evaluating at ${filePath}:${location.line} ${result.stderr}`;
      console.log(source);
    }
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
