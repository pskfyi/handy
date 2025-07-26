import { red } from "@std/fmt/colors";
import { consoleWidth } from "../../cli/consoleSize.ts";
import { elideEnd } from "../../string/elide.ts";
import {
  evaluateAll,
  EvaluateAllResult,
  EvaluateOptions,
  NoLanguageError,
  UnknownLanguageError,
} from "../codeBlock/eval.ts";
import { FAILURE, SKIP, SUCCESS } from "../../cli/icons.ts";

export async function evalCodeBlocks(
  filePath: string,
  replace?: EvaluateOptions["replace"],
): Promise<EvaluateAllResult[]> {
  const markdown = await Deno.readTextFile(filePath);
  console.log(`Executing code blocks in ${filePath}`);

  const width = consoleWidth(80);
  console.log("-".repeat(width));

  const results = await evaluateAll(markdown, { replace });

  for (const [details, { line }, result] of results) {
    if (details.type === "indented") continue;
    if (details.lang === "no-eval") continue;

    const metaArgs = (details.meta ?? "").split(/ +/);
    if (metaArgs.includes("no-eval")) continue;

    const { lang, code } = details;

    const icon = (result instanceof NoLanguageError ||
        result instanceof UnknownLanguageError)
      ? SKIP
      : (result instanceof Error || !result.success)
      ? FAILURE
      : SUCCESS;

    const iconLength = icon.length;
    const langLength = String(lang).length;

    const prefix = `${icon} ${details.lang} `;
    const spacesInPrefix = 2;

    const inlineCode = code.trim().replace(/\s+/g, " ");
    const maxLength = width - langLength - iconLength - spacesInPrefix;

    console.log(`${prefix}${elideEnd(inlineCode, { maxLength })}`);

    if ("success" in result && !result.success) {
      const source = `${filePath}:${line}`;
      console.log(`${red("→")} error at ${source}\n${result.stderr}`);
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

  results.forEach(([, , result]) => {
    if (!(result instanceof Error) && !result.success) Deno.exit(1);
  });
}
