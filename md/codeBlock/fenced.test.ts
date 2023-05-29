import { assert, assertEquals, describe, test } from "../../_deps/testing.ts";
import { create, findAll, parse } from "./fenced.ts";

describe("create", () => {
  test("default", () => assertEquals(create("!"), "```\n!\n```"));

  test("options.char", () => {
    assertEquals(
      create("const a = 1;", { char: "`" }),
      "```\nconst a = 1;\n```",
    );

    assertEquals(
      create("````", { char: "~" }),
      "~~~\n````\n~~~",
    );

    assertEquals(
      create("", { char: "`", lang: "`" }),
      "~~~`\n\n~~~",
    );
  });

  test("created fence", () => {
    assertEquals(
      create("````", { char: "`" }),
      "`````\n````\n`````",
    );

    assertEquals(
      create("~~~", { char: "~" }),
      "~~~~\n~~~\n~~~~",
    );
  });

  test("options.lang", () =>
    assert(
      create("", { lang: "ts" })
        .split("\n")[0]
        .endsWith("ts"),
    ));

  test("options.meta", () =>
    assert(
      create("", { meta: "some info" })
        .split("\n")[0]
        .endsWith("some info"),
    ));
});

describe("parse", () => {
  test("result.type", () => assertEquals(parse("```\n```").type, "fenced"));

  test("result.fence", () => {
    assertEquals(parse("```\n```").fence, "```");
    assertEquals(parse("~~~\n~~~").fence, "~~~");
  });

  test("result.code", () => {
    assertEquals(parse("```\n```").code, "");
    assertEquals(parse("```\nfoo\n```").code, "foo");
    assertEquals(parse("```\nfoo\n bar\n```").code, "foo\n bar");
  });

  test("result.lang", () => {
    assertEquals(parse("```\n```").lang, undefined);
    assertEquals(parse("```lang meta data\n```").lang, "lang");
  });

  test("result.meta", () => {
    assertEquals(parse("```\n```").meta, undefined);
    assertEquals(parse("```lang meta data\n```").meta, "meta data");
  });

  test("w/ Windows newlines", () =>
    assertEquals(
      parse("```\r\nHello!\r\n```"),
      {
        type: "fenced",
        fence: "```",
        code: "Hello!",
      },
    ));
});

const type = "fenced";

test("findAll", () =>
  assertEquals(
    findAll(
      "foo\n\n    bar\n\n```ba z\nqux\n```" +
        "   quux\n\n~~~~corge\ngrault\n~~~~",
    ),
    [
      [
        { type, fence: "```", code: "qux", lang: "ba", meta: "z" },
        { column: 1, line: 5, offset: 14 },
      ],
      [
        { type, fence: "~~~~", code: "grault", lang: "corge" },
        { column: 1, line: 9, offset: 38 },
      ],
    ],
  ));
