import {
  any,
  Language,
  regexp,
  sequence,
  string,
} from "../../parser/combinator.ts";

/* COMMON */

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

/* PARSE */

const type = regexp(/^[a-zA-Z]+/).match;
const scope = sequence("(", regexp(/^[^\r\n\(\)]+/).match, ")").item(1);
const description = string.inline;
const delimiter = sequence(string("!").boolean, ": ");

const footerKey = regexp(/^(BREAKING( |-)CHANGE|[^\s:]+)(: | (?=#))/).group(1);
const nonFooterLine = any(string.whitespace, string.inline.not(footerKey));
const nonFooterText = nonFooterLine.oneOrMore.join("").trimEnd;

const body = nonFooterText.toObject("body");
const footer = sequence(footerKey, nonFooterText).toObject("key", "value");
const footers = footer.oneOrMore.into((footers) => ({ footers }));

type BodyAndFooters = Pick<ConventionalCommit, "body" | "footers">;

const bodyAndFooters = sequence(
  string.blankLine.ignore,
  any(
    sequence(body, string.end),
    sequence(footers, string.end),
    sequence(body, footers, string.end),
  ),
).flat.into(([obj1, obj2]): BodyAndFooters => ({ ...obj1, ...obj2 }));

const message = sequence(
  type,
  scope.optional,
  delimiter.item(0), // breaking change indicator
  description,
  bodyAndFooters.fallback({}),
  string.end,
).into(([type, scope, breaking, description, { body, footers }]) => {
  const message: ConventionalCommit = { type, description };

  breaking ||= (footers || [])
    .some(({ key }) => key === "BREAKING CHANGE" || key === "BREAKING-CHANGE");

  if (scope) message.scope = scope;
  if (breaking) message.breakingChange = true;
  if (body) message.body = body;
  if (footers) message.footers = footers;

  return message;
});

/** A language for parsing Conventional Commits messages.
 *
 * @example
 * conventionalCommit.message.parse("fix(app)!: use correct type for `foo`"); */
export const conventionalCommit = {
  type,
  scope,
  delimiter,
  description,
  body,
  footer,
  footers,
  message,
} satisfies Language;

export class ConventionalFormatError extends TypeError {
  constructor(cause: unknown) {
    super(
      "Commit message does not conform to Conventional Commits format",
      { cause },
    );
    this.name = "ConventionalFormatError";
  }
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
export function parse(input: string): ConventionalCommit {
  try {
    return message.parse(input)[0];
  } catch (error) {
    throw new ConventionalFormatError(error);
  }
}

/* STRINGIFY */

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
