import { splitOnFirst } from "../../string/splitOn.ts";

export type ConventionalCommitFooter = {
  key: string;
  value: string;
};

export type ConventionalCommit = {
  type: string;
  scope?: string;
  description: string;
  body?: string;
  footers?: ConventionalCommitFooter[];
  breakingChange?: true;
};

export class ConventionalFormatError extends TypeError {
  constructor() {
    super("Commit message does not conform to Conventional Commits format");
    this.name = "ConventionalFormatError";
  }
}

export class ConventionalTypeError extends TypeError {
  constructor() {
    super("Type cannot be empty or include whitespace");
    this.name = "ConventionalTypeError";
  }
}

export class ConventionalScopeError extends TypeError {
  constructor() {
    super("Scope cannot be empty string or include whitespace");
    this.name = "ConventionalScopeError";
  }
}

export class ConventionalDescriptionError extends TypeError {
  constructor() {
    super("Description cannot be empty or include newlines");
    this.name = "ConventionalDescriptionError";
  }
}

export class ConventionalFooterError extends TypeError {
  constructor() {
    super(
      'Footer key must not be empty and cannot include whitespace unless it is "BREAKING CHANGE"',
    );
    this.name = "ConventionalFooterError";
  }
}

const SUBJECT_REGEX =
  /^(?<type>\w+)(\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/;

const FOOTER_SEGMENT_REGEX = /^((\S+|BREAKING CHANGE): .|\S+ #.)/;

const FOOTER_REGEX =
  /^((?<colonKey>[\S]+|BREAKING CHANGE): (?<colonValue>[\s\S]*)|(?<hashKey>[\S]+) (?<hashValue>#[\s\S]*))/;

function parseSubject(line: string) {
  const { type, breaking, scope, description } =
    line.match(SUBJECT_REGEX)?.groups ?? {};

  const breakingChange = (Boolean(breaking)) || undefined;

  return [type, scope, breakingChange, description] as const;
}

function parseRemainder(remainder: string) {
  const bodySegments = [] as string[];
  const footers = [] as ConventionalCommitFooter[];

  for (const segment of remainder.split(/\n *\n/).reverse()) {
    if (!bodySegments.length && FOOTER_SEGMENT_REGEX.test(segment)) {
      footers.unshift(...parseFooters(segment));
      continue;
    }

    bodySegments.unshift(segment);
  }

  return [bodySegments, footers] as const;
}

function parseFooters(segment: string): ConventionalCommitFooter[] {
  const footers = [] as ConventionalCommitFooter[];

  for (const line of segment.split("\n")) {
    const match = line.match(FOOTER_REGEX);

    if (match) {
      const { colonKey, colonValue, hashKey, hashValue } = match.groups!;
      const key = colonKey ?? hashKey;
      const value = (colonValue ?? hashValue).trim();
      footers.push({ key, value });
    } else {
      footers.at(-1)!.value += `\n${line.trim()}`;
    }
  }

  return footers;
}

/** Parse a Conventional Commit message into its constituent parts.
 *
 * See the https://www.conventionalcommits.org/en/v1.0.0/ for more information.
 *
 * @throws {ConventionalFormatError} if the message does not conform to the Conventional Commits format
 *
 * @example
 * import { parse } from "https://deno.land/x/git/commit/conventional.ts";
 *
 * const commit = parse("fix(app)!: use correct type for `foo`");
 *
 * console.log(commit);
 * // {
 * //   type: "fix",
 * //   scope: "app",
 * //   breakingChange: true,
 * //   description: "correct minor typos in code",
 * // } */
export function parse(message: string): ConventionalCommit {
  const [subject, remainder] = splitOnFirst("\n\n", message);
  const [type, scope, breakingType, description] = parseSubject(subject);

  if (!type || !description) throw new ConventionalFormatError();

  const [bodySegments, footers] = remainder
    ? parseRemainder(remainder)
    : [[], []];

  const breakingChange = (
    breakingType ||
    footers?.some(({ key }) => key.match(/BREAKING[ -]CHANGE/))
  ) || undefined;

  const result: ConventionalCommit = { type, description };

  if (scope) result.scope = scope;
  if (bodySegments.length) result.body = bodySegments.join("\n\n");
  if (footers.length) result.footers = footers;
  if (breakingChange) result.breakingChange = breakingChange;

  return result;
}

const WHITESPACE = /\s/;

/** Stringify a `ConventionalCommit` object into a Conventional Commit message.
 *
 * See the https://www.conventionalcommits.org/en/v1.0.0/ for more information.
 *
 * @throws {ConventionalTypeError} if the type is empty or includes whitespace
 * @throws {ConventionalScopeError} if the scope is an empty string or includes whitespace
 * @throws {ConventionalDescriptionError} if the description is empty or includes newlines
 * @throws {ConventionalFooterError} if a footer key is empty or includes whitespace unless it is `"BREAKING CHANGE"`
 *
 * @example
 * import { stringify } from "https://deno.land/x/git/commit/conventional.ts";
 *
 * const commit = {
 *   type: "fix",
 *   scope: "app",
 *   breakingChange: true,
 *   description: "correct minor typos in code",
 * };
 *
 * console.log(stringify(commit));
 * // fix(app)!: correct minor typos in code */
export function stringify(commit: ConventionalCommit): string {
  const { type, scope, description: desc, body, footers = [], breakingChange } =
    commit;

  if (!type || type.match(WHITESPACE)) throw new ConventionalTypeError();
  if (scope === "" || scope?.match(WHITESPACE)) {
    throw new ConventionalScopeError();
  }
  if (!desc || desc.match(/\n/)) throw new ConventionalDescriptionError();

  const bodySegments = body ? [body] : [];
  const footerSegments = footers.map(({ key, value }) => {
    if (!key || (key.match(/\s/) && key !== "BREAKING CHANGE")) {
      throw new ConventionalFooterError();
    }

    return value.startsWith("#") ? `${key} ${value}` : `${key}: ${value}`;
  });

  const breaking = breakingChange ||
    footers.some(({ key }) => key.match(/BREAKING[ -]CHANGE/));

  const subject = [type, scope && `(${scope})`, breaking && "!", ": ", desc]
    .filter(Boolean).join("");

  return [subject, ...bodySegments, ...footerSegments].join("\n\n");
}
