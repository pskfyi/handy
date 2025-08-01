import { parseArgs } from "@std/cli/parse-args";
import { clipboard } from "../io/mod.ts";
import { indent } from "../string/indent.ts";
import {
  type ConventionalCommit,
  parse as parseCommit,
} from "../git/commit/conventional.ts";
import { getSpan as getCommitSpan } from "../git/commit/get.ts";
import type { CommitDescription } from "../git/commit/types.ts";
import { getLatest as getLatestTag } from "../git/tag.ts";
import { consoleWidth } from "../cli/consoleSize.ts";
import { elideEnd } from "../string/elide.ts";

/**
 * @module
 *
 * Generates release notes from conventional commits in a git repository. */

type CommitInfo = ConventionalCommit & Omit<CommitDescription, "message">;

const TYPE_NAMES: Record<string, string> = {
  feat: "Features",
  fix: "Fixes",
  refactor: "Refactors",
  perf: "Performance Improvements",
  docs: "Documentation",
  test: "Tests",
  chore: "Chores",
  style: "Styles",
  ci: "Continuous Integration",
  build: "Build System",
  revert: "Reverts",
};

async function commits(
  log: (message: string) => void,
  commit?: string,
  types?: string[],
  inclusive = false,
): Promise<
  readonly [Record<string, CommitInfo[]>, Record<string, CommitInfo[]>]
> {
  commit ??= await getLatestTag();
  const rawCommits = (await getCommitSpan([commit, "HEAD"], { inclusive }))
    .reverse();

  log(`  Commits since ${commit}: ${rawCommits.length}`);

  const commits: CommitInfo[] = [];
  const terminalWidth = consoleWidth(80);

  for (const { message, author, date, hash: longHash } of rawCommits) {
    const hash = longHash.substring(0, 7);

    try {
      const conventionalCommit = parseCommit(message);

      if (types && !types.includes(conventionalCommit.type)) {
        const { type } = conventionalCommit;
        log(`  Ignoring excluded type ${type} ${hash}`);
        continue;
      }

      commits.push({ hash, author, date, ...conventionalCommit });
    } catch {
      log(`  Ignoring unconventional commit  ${hash}`);
      log(`    ${elideEnd(message, { maxLength: terminalWidth - 4 })}`);
    }
  }

  const byType = (commits: CommitInfo[]) =>
    commits.reduce<Record<string, CommitInfo[]>>((acc, commit) => {
      const { type } = commit;
      acc[type] = acc[type] ?? [];
      acc[type].push(commit);
      return acc;
    }, {});

  const breaking = byType(commits.filter((c) => c.breakingChange));
  const nonBreaking = byType(commits.filter((c) => !c.breakingChange));

  return [breaking, nonBreaking] as const;
}

function typeName(type: string, typeNames: Record<string, string>): string {
  return typeNames[type] ?? `${type[0].toUpperCase()}${type.slice(1)} Commits`;
}

function sortTypes(
  breaking: Record<string, CommitInfo[]>,
  nonBreaking: Record<string, CommitInfo[]>,
): string[] {
  return [
    ...new Set([
      ...Object.keys(breaking),
      ...Object.keys(nonBreaking),
    ]),
  ].sort();
}

function asListItem(
  { type, scope, description, body, footers, breakingChange, hash }: CommitInfo,
  groupByType?: boolean,
): string {
  const typeAndScope = groupByType
    ? scope ? `(${scope})` : ""
    : scope
    ? `${type}(${scope})`
    : type;

  let listItem = "* ";

  listItem += breakingChange
    ? typeAndScope
      ? `**Breaking Change** ${typeAndScope}: `
      : "**Breaking Change**: "
    : typeAndScope
    ? `${typeAndScope}: `
    : "";

  listItem += `${description} (${hash})`;

  if (body) listItem += `\n\n${indent(body, 2).replace(/^ +$/mg, "")}`;

  if (footers?.length) {
    const footersSegment = footers
      .map(({ key, value }) => `${key}: ${value}`)
      .join("\n\n");

    listItem += `\n\n${indent(footersSegment, 2).replace(/^ +$/mg, "")}`;
  }

  return listItem;
}

function asUnorderedList(commits: CommitInfo[], groupByType = false): string {
  return commits.map((c) => asListItem(c, groupByType)).join("\n\n");
}

function releaseNotesUngrouped(
  sortedTypes: string[],
  breaking: Record<string, CommitInfo[]>,
  nonBreaking: Record<string, CommitInfo[]>,
): string {
  let breakingMarkdown = "";
  let nonBreakingMarkdown = "";

  for (const type of sortedTypes) {
    const breakingCommits = breaking[type] ?? [];
    const nonBreakingCommits = nonBreaking[type] ?? [];

    breakingCommits.length &&
      (breakingMarkdown += asUnorderedList(breakingCommits) + "\n\n");

    nonBreakingCommits.length &&
      (nonBreakingMarkdown += asUnorderedList(nonBreakingCommits) + "\n\n");
  }

  return breakingMarkdown + nonBreakingMarkdown;
}

function releaseNotesByType(
  sortedTypes: string[],
  typeNames: Record<string, string>,
  breaking: Record<string, CommitInfo[]>,
  nonBreaking: Record<string, CommitInfo[]>,
): string {
  typeNames = { ...TYPE_NAMES, ...typeNames };
  let markdown = "";

  for (const type of sortedTypes) {
    const breakingCommits = breaking[type] ?? [];
    const nonBreakingCommits = nonBreaking[type] ?? [];

    if (!breakingCommits.length && !nonBreakingCommits.length) continue;

    markdown += `## ${typeName(type, typeNames)}\n\n`;

    breakingCommits.length &&
      (markdown += asUnorderedList(breakingCommits, true) + "\n\n");

    nonBreakingCommits.length &&
      (markdown += asUnorderedList(nonBreakingCommits, true) + "\n\n");
  }

  return markdown;
}

export type MakeReleaseNotesOptions = {
  cwd?: string;
  commit?: string;
  /** Whether to include the starting commit in the release notes.
   *
   * @example
   * // find commits since latest tag, but not including it
   * makeReleaseNotes()
   * // include latest tag commit
   * makeReleaseNotes({ inclusive: true })
   *
   * // find commits since commit abc1234, but not including it
   * makeReleaseNotes({ commit: "abc1234" })
   * // include commit abc1234
   * makeReleaseNotes({ commit: "abc1234", inclusive: true })
   */
  inclusive?: boolean;
  verbose?: boolean;
  groupByType?: boolean;
  types?: string[];
  typeNames?: Record<string, string>;
};

export async function makeReleaseNotes(
  { cwd, commit, inclusive, verbose, groupByType, types, typeNames = {} }:
    MakeReleaseNotesOptions = {},
): Promise<string> {
  if (cwd) Deno.chdir(cwd);

  const log = (message: string) => verbose && console.log(message);
  const [breaking, nonBreaking] = await commits(log, commit, types, inclusive);
  const sortedTypes = types ? types : sortTypes(breaking, nonBreaking);
  const markdown = groupByType
    ? releaseNotesByType(sortedTypes, typeNames, breaking, nonBreaking)
    : releaseNotesUngrouped(sortedTypes, breaking, nonBreaking);

  return markdown.trim();
}

function typeNames(flags: Record<string, unknown>): Record<string, string> {
  const typeNames: Record<string, string> = {};

  const isKnown = (flag: string) =>
    ["_", "type", "to-clipboard", "verbose", "group-by-type", "c", "v", "g"]
      .includes(flag);

  for (const flag in flags) {
    if (isKnown(flag)) continue;
    const value = flags[flag];
    if (typeof value !== "string") continue;

    typeNames[flag] = value;
  }

  return typeNames;
}

export const HELP_MESSAGE: string = `
In a git repo, scan the commit history for conventional commits since the last tag and generate a markdown-formatted list of features and fixes.

Usage:
  deno run -A jsr:@psk/handy/scripts/makeReleaseNotes [options] [path]

Arguments:
  path    Path to a git repo to scan. Defaults to the current working directory.

Options:
  -h, --help          Show this help message
  -c, --to-clipboard  Copy release notes to clipboard
  -i, --inclusive     Include the first commit
  -v, --verbose       Print verbose output
  -g, --group-by-type Group commits by type using H2 headings
  --commit=<commit>   Commit to use as base for release notes
  --types=<types>     Comma-separated list of types to include
  --<type>=<name>     Name to use for a type's H2 when grouping by type

Examples:
  deno run -A jsr:@psk/handy/scripts/makeReleaseNotes -cgv

  deno run -A jsr:@psk/handy/scripts/makeReleaseNotes --commit v1.0.0

  deno run -A jsr:@psk/handy/scripts/makeReleaseNotes \\
    --types=feat,custom --custom="Custom's Section Heading"
`.trim();

if (import.meta.main) {
  const flags = parseArgs(Deno.args, {
    alias: {
      c: "to-clipboard",
      v: "verbose",
      g: "group-by-type",
      h: "help",
      i: "inclusive",
    },
    boolean: ["to-clipboard", "verbose", "group-by-type", "help", "inclusive"],
    string: ["_", "types", "commit"],
    stopEarly: true,
  });

  if (flags.help) {
    console.log(HELP_MESSAGE);
    Deno.exit(0);
  }

  const opts: MakeReleaseNotesOptions = {
    cwd: flags._[0],
    commit: flags.commit,
    verbose: flags.verbose,
    inclusive: flags.inclusive,
    groupByType: flags["group-by-type"],
    types: flags["types"]?.split(","),
    typeNames: typeNames(flags),
  };

  const markdown = await makeReleaseNotes(opts);

  if (flags["to-clipboard"]) {
    clipboard.copy(markdown);
    console.log(`Release notes copied to clipboard.`);
  } else {
    opts.verbose && console.log("<!--- BEGIN RELEASE NOTES --->");
    console.log(markdown);
    opts.verbose && console.log("<!--- END RELEASE NOTES --->");
  }
}
