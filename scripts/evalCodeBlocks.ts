import {
  findAll as findAllCodeBlocks,
  parse as parseCodeBlock,
} from "../md/codeBlock/fenced.ts";

/** Imports a markdown file and evaluates each TS code block using `deno eval`
 * Useful for confirming that imports and code samples in a readme are valid.
 */
export async function evalCodeBlocks(
  filePath: string,
  replace = [] as [string | RegExp, string][],
) {
  const markdown = await Deno.readTextFile(filePath);

  console.log(`Executing code blocks in ${filePath}`);

  for (const codeBlock of findAllCodeBlocks(markdown)) {
    const { code, lang } = parseCodeBlock(codeBlock);

    if (lang !== "ts") continue;

    const replacedCode = replace.reduce(
      (code, [search, replace]) => code.replaceAll(search, replace),
      code,
    );

    console.log(
      await Deno.run({
        cmd: ["deno", "eval", "--check", "--ext=ts", replacedCode],
      }).status(),
    );
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
