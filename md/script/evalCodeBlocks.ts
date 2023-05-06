import { green, red } from "https://deno.land/std@0.182.0/fmt/colors.ts";
import {
  evaluateAll,
  EvaluateOptions,
  NoLanguageError,
  UnknownLanguageError,
} from "../codeBlock/eval.ts";

export async function evalCodeBlocks(
  filePath: string,
  replace?: EvaluateOptions["replace"],
): Promise<void> {
  const markdown = await Deno.readTextFile(filePath);
  console.log(`Executing code blocks in ${filePath}`);

  const consoleWidth = Deno.isatty(Deno.stdout.rid)
    ? Deno.consoleSize().columns
    : 80;
  console.log("-".repeat(consoleWidth));

  const results = await evaluateAll(markdown, { replace });

  for (const [details, result] of results) {
    if (details.type === "indented") continue;
    if (details.lang === "no-eval") continue;

    const metaArgs = (details.meta ?? "").split(/ +/);
    if (metaArgs.includes("no-eval")) continue;

    const { lang, code } = details;

    const langLength = lang?.length ?? 0;
    const inlineCode = code.trim().replace(/\r?\n/g, "\\n");
    const firstChars = inlineCode.slice(0, consoleWidth - langLength - 4);

    const message = firstChars.length < inlineCode.length
      ? `${details.lang} ${firstChars}...`
      : `${details.lang} ${firstChars}`;

    console.log(message);

    if (result instanceof NoLanguageError) {
      console.log("  No language code; skipping");
    } else if (result instanceof UnknownLanguageError) {
      console.log("  Unknown language code; skipping");
    } else if (result instanceof Error) {
      console.log("  Unknown error encountered outside of evaluation:");
      console.error(result);
    } else {
      const status = result.success ? green("Success") : red("Failure");
      console.log(`  ${status}`);
    }
  }
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

  await evalCodeBlocks(filePath, replace);
}
