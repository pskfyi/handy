import { gray, green, red } from "../../_deps/fmt.ts";
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
      consoleWidth - langLength - iconLength - 5,
    );

    const message = firstChars.length < inlineCode.length
      ? `${colorIcon} ${details.lang} ${firstChars}...`
      : `${colorIcon} ${details.lang} ${firstChars}`;

    console.log(message);
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
