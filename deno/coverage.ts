import { cmd } from "../cli/cmd.ts";
import { parser as markdownTableParser } from "../md/table/parse.ts";

export type CoverageOptions = {
  /** Coverage directory to scan. Deno default is `coverage`. */
  dir?: string;
  /** See: https://docs.deno.com/runtime/reference/cli/coverage/#inclusions-and-exclusions */
  include?: string[];
  /** See: https://docs.deno.com/runtime/reference/cli/coverage/#inclusions-and-exclusions */
  exclude?: string[];
  /** Coverage thresholds for branches and lines, or a shared value. */
  threshold?: number | { branches: number; lines: number };
};

export type CoverageData = {
  branches: number;
  lines: number;
};

function _data(row: Record<string, string>): CoverageData {
  return {
    branches: Number(row["Branch %"]),
    lines: Number(row["Line %"]),
  };
}

export type CoverageResult = {
  all: CoverageData;
  files: Record<string, CoverageData>;
  passed: boolean | null;
};

function _threshold(
  value?: number | { branches: number; lines: number },
): CoverageData | null {
  if (typeof value === "number") {
    return { branches: value, lines: value };
  }
  return value ? value : null;
}

function _passed(
  data: CoverageData,
  threshold: CoverageData | null,
): boolean | null {
  if (!threshold) return null;

  return (data.branches >= threshold.branches &&
    data.lines >= threshold.lines);
}

export async function coverage(
  opts: CoverageOptions = {},
): Promise<CoverageResult> {
  const {
    dir = opts?.dir ?? "coverage",
    include = opts?.include ?? [],
    exclude = opts?.exclude ?? [],
  } = opts;

  const command = ["deno", "coverage", dir];
  include.map((pattern) => command.push(`--include=${pattern}`));
  exclude.map((pattern) => command.push(`--exclude=${pattern}`));

  const stdout = await cmd(command, { env: { NO_COLOR: "true" } });

  const [result] = markdownTableParser.parse(stdout);
  const { rows } = result;

  const all = _data(rows.pop()!);
  const files = Object.fromEntries(rows.map((row) => [row.File, _data(row)]));
  const threshold = _threshold(opts.threshold);
  const passed = _passed(all, threshold);

  return { all, files, passed };
}

/** Gather coverage and throw if below threshold. Default threshold is 60% if
 * not specified. */
export async function assertCoverage(opts: CoverageOptions): Promise<void> {
  opts.threshold ??= 60;
  const threshold = _threshold(opts.threshold);
  const { all, passed } = await coverage(opts);
  const { lines, branches } = all;

  if (!passed) {
    throw new Error(
      `Coverage below threshold:\n` +
        `  ${lines}% lines (threshold ${threshold?.lines}%)\n` +
        `  ${branches}% branches (threshold ${threshold?.branches}%)`,
    );
  }
}
