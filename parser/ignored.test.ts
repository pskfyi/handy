import { assert, assertEquals, test } from "../_deps/testing.ts";
import { TextCursor } from "../string/TextCursor.ts";
import { assertIgnored, assertParseResult } from "./asserts.ts";
import { CoreParser } from "./core.ts";
import { Ignored, IgnoredParser, NonIgnored } from "./ignored.ts";

test("types", () => {
  const _ignored: Ignored = IgnoredParser.SYMBOL;
  const _nonIgnored: NonIgnored<string | Ignored> = "foo";
});

const parser = new IgnoredParser((i) => [, new TextCursor(i, 3)]);

test(".parse()", () => {
  assertIgnored(parser.parse("bar"));
});

test(".and()", () => {
  class NextParser extends CoreParser<string> {
    constructor(_?: unknown, toString: () => string = () => "next") {
      super((i) => ["next", new TextCursor(i, i.length)], toString);
    }
  }

  const next = new NextParser();
  const joined = parser.and(next);

  assertParseResult(joined.parse("foonext"), "next");
  assertEquals(`${parser}`, "ignored");
  assertEquals(`${next}`, "next");
  assertEquals(`${joined}`, "ignored.and(next)");
});

test(".SYMBOL", () => {
  assert(typeof IgnoredParser.SYMBOL === "symbol");
});
