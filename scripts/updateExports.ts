import { parseArgs } from "@std/cli/parse-args";
import { join } from "@std/path/join";
import { resolve } from "@std/path/resolve";
import { dirname } from "@std/path/dirname";
import { determine } from "../deno/exports/determine.ts";
import { assertUnmodified } from "../git/asserts.ts";
import { replaceJsonFile } from "../fs/json.ts";
import * as env from "../env/mod.ts";

function assertFile(path: string): asserts path is string {
  if (!Deno.statSync(path).isFile) {
    throw new Error(`Expected ${path} to be a file, but got a directory.`);
  }
}

function _getDenoJsonPath(flags: { _: Array<string | number> }): string {
  const maybeInputPath: string | number | undefined = flags._[0];

  if (typeof maybeInputPath === "number") {
    throw new Error("Expected a path argument, but got a number.");
  }

  if (maybeInputPath?.endsWith("deno.json")) {
    assertFile(maybeInputPath);

    return maybeInputPath;
  }

  const dir = maybeInputPath || Deno.cwd();
  const denoJsonPath = join(dir, "deno.json");

  assertFile(denoJsonPath);

  return denoJsonPath;
}

type UpdateExportsOptions = {
  dryRun?: boolean;
  root?: string;
};

export async function updateExports(
  denoJsonPath: string,
  options: UpdateExportsOptions = {},
): Promise<void> {
  const denoJsonDir = dirname(denoJsonPath);
  const relativeTo = options.root ?? denoJsonDir;

  const exportsField = await determine(denoJsonDir, { relativeTo });

  if (options.dryRun) {
    console.log(
      "Dry run. Would update exports to:\n",
      JSON.stringify(exportsField, null, 2),
    );
    return;
  }

  await replaceJsonFile(denoJsonPath, (json) => {
    json.exports = exportsField;
    return json;
  });
}

export const HELP_MESSAGE: string = `
Updates the exports field in a deno.json file to include .ts files in the current directory and its subdirectories, sorted by key. Excludes files and directories that start with a dot or underscore, and test files.

Usage:
  deno run -A jsr:@psk/handy/scripts/updateExports [path]

Arguments:
  path    A deno.json file or directory containing one. Searches the current directory by default.

Options:
  -h, --help         Show this help message
  -d, --dry-run      Show what would be done without making any changes
  -a, --assert       Returns exit code 1 if the file has unstaged changes after running the script. Defaults to true in CI and false otherwise.
  -r, --root=<path>  Make export paths relative to the provided path. Defaults to the deno.json file's directory.

Examples:
  deno run -A jsr:@psk/handy/scripts/updateExports

  deno run -A jsr:@psk/handy/scripts/updateExports ./path/to/deno.json

  deno run -A jsr:@psk/handy/scripts/updateExports --root=src
`.trim();

if (import.meta.main) {
  const flags = parseArgs(Deno.args, {
    alias: {
      a: "assert",
      d: "dry-run",
      h: "help",
      r: "root",
    },
    boolean: ["help", "dry-run", "assert"],
    string: ["root"],
    stopEarly: true,
    default: {
      assert: env.boolean("CI"),
    },
  });

  if (flags.help) {
    console.log(HELP_MESSAGE);
    Deno.exit(0);
  }

  const denoJsonPath = _getDenoJsonPath(flags);

  await updateExports(denoJsonPath, {
    dryRun: flags["dry-run"],
    root: flags.root ? resolve(flags.root) : undefined,
  });

  if (flags.assert ?? Deno.env.get("CI")) {
    await assertUnmodified(denoJsonPath)
      .catch(() => {
        console.error(
          "Unstaged changes detected in deno.json. Update your exports field to match the current file structure.",
        );
        Deno.exit(1);
      });
  }
}
