import { assertEquals, test } from "../../_deps/testing.ts";
import { parse } from "./parse.ts";

test("parses indented blocks", () =>
  assertEquals(
    parse("    foo\n    bar"),
    {
      type: "indented",
      code: "foo\nbar",
    },
  ));

test("parses fenced blocks", () =>
  assertEquals(
    parse("```lang meta data\nfoo\nbar\n```"),
    {
      type: "fenced",
      char: "`",
      fence: "```",
      lang: "lang",
      meta: "meta data",
      code: "foo\nbar",
    },
  ));
