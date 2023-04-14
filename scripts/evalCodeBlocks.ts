/** Imports a markdown file and evaluates each TS code block using `deno eval`
 * Useful for confirming that imports and code samples in a readme are valid.
 */
export async function evalCodeBlocks(
  filePath: string,
  replace = [] as [string | RegExp, string][],
) {
  const markdown = await Deno.readTextFile(filePath);
  const codeBlocks = markdown.matchAll(/```ts([\s\S]*?)```/g);

  console.log(`Executing code blocks in ${filePath}}`);
  for (const codeBlock of codeBlocks) {
    const code = replace.reduce(
      (code, [search, replace]) => code.replace(search, replace),
      codeBlock[1],
    );

    console.log(
      await Deno.run({ cmd: ["deno", "eval", "--check", "--ext=ts", code] })
        .status(),
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
