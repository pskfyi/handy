import { assert, assertEquals, describe, it } from "../../_deps/testing.ts";
import { create, findAll, parse } from "./fenced.ts";

describe("create", () => {
  it("defaults to ```", () => assertEquals(create("!"), "```\n!\n```"));

  describe("options.char", () => {
    it("defaults to `", () =>
      assertEquals(
        create("const a = 1;", { char: "`" }),
        "```\nconst a = 1;\n```",
      ));

    it("can use ~", () =>
      assertEquals(
        create("````", { char: "~" }),
        "~~~\n````\n~~~",
      ));

    it("always uses ~ if info has `", () =>
      assertEquals(
        create("", { char: "`", lang: "`" }),
        "~~~`\n\n~~~",
      ));
  });

  describe("fence", () => {
    it("adds ` as needed", () =>
      assertEquals(
        create("````", { char: "`" }),
        "`````\n````\n`````",
      ));

    it("adds ~ as needed", () =>
      assertEquals(
        create("~~~", { char: "~" }),
        "~~~~\n~~~\n~~~~",
      ));
  });

  describe("lang", () => {
    it("appears on the first line", () =>
      assert(
        create("", { lang: "ts" })
          .split("\n")[0]
          .endsWith("ts"),
      ));
  });

  describe("meta", () => {
    it("appears in the first line", () =>
      assert(
        create("", { meta: "some info" })
          .split("\n")[0]
          .endsWith("some info"),
      ));
  });
});

describe("parse", () => {
  it('has result.type "fenced"', () =>
    assertEquals(parse("```\n```").type, "fenced"));

  describe("result.char", () => {
    it('can be "`"', () => assertEquals(parse("```\n```").char, "`"));
    it('can be "~"', () => assertEquals(parse("~~~\n~~~").char, "~"));
  });

  describe("result.fence", () => {
    it('can be "`"', () => assertEquals(parse("```\n```").fence, "```"));
    it('can be "~"', () => assertEquals(parse("~~~\n~~~").fence, "~~~"));
  });

  describe("result.code", () => {
    it('defaults to ""', () => assertEquals(parse("```\n```").code, ""));

    it("gets code from one-line blocks", () =>
      assertEquals(parse("```\nfoo\n```").code, "foo"));

    it("gets code from multi-line blocks", () =>
      assertEquals(parse("```\nfoo\n bar\n```").code, "foo\n bar"));
  });

  describe("result.lang", () => {
    it("defaults to undefined", () =>
      assertEquals(parse("```\n```").lang, undefined));

    it("gets first word of info string", () =>
      assertEquals(parse("```lang meta data\n```").lang, "lang"));
  });

  describe("result.meta", () => {
    it("defaults to undefined", () =>
      assertEquals(parse("```\n```").meta, undefined));

    it("gets rest of info string", () =>
      assertEquals(parse("```lang meta data\n```").meta, "meta data"));
  });

  it("handles Windows newlines", () =>
    assertEquals(
      parse("```\r\nHello!\r\n```"),
      {
        type: "fenced",
        char: "`",
        fence: "```",
        code: "Hello!",
      },
    ));
});

describe("findAll", () => {
  it("finds all code blocks in a string", () =>
    assertEquals(
      findAll(
        "foo\n\n    bar\n\n```baz\nqux\n```" +
          "   quux\n\n```corge\ngrault\n```",
      ),
      ["```baz\nqux\n```", "```corge\ngrault\n```"],
    ));
});
