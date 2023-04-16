import { assertEquals, describe, it } from "../../_deps/testing.ts";
import { parse } from "./parse.ts";

describe("parse", () => {
  it("parses indented code blocks", () =>
    assertEquals(
      parse("    foo\n    bar"),
      {
        type: "indented",
        indentation: "    ",
        code: "foo\nbar",
      },
    ));

  it("parses fenced code blocks", () =>
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
});
