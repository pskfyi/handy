import { describe, test } from "@std/testing/bdd";
import { headerSeparatorParser, parser, rowParser } from "./parse.ts";
import { assertParseResult } from "../../parser/asserts.ts";
import { dedent } from "../../string/dedent.ts";
import { assertEquals } from "@std/assert/equals";

describe("table", () => {
  describe("parse", () => {
    test("rows", () => {
      const input = "| Header1   | | Header2   |";
      const result = rowParser.parse(input);
      assertParseResult(result, ["Header1", "", "Header2"]);
    });

    test("header separator", () => {
      const input = "|:----------:|:----------:|";
      const result = headerSeparatorParser.parse(input);
      assertParseResult(result, [":-:", ":-:"]);
    });

    test("table", () => {
      const input = dedent(`
        | H1  | H2  | H3  |
        | :-- | :-: | --: |
        | C1  | C2  | C3  |
        | C4  | C5  | C6  |
      `).trim();

      const [result] = parser.parse(input);

      assertEquals(result.headers, [
        { label: "H1", alignment: "left" },
        { label: "H2", alignment: "center" },
        { label: "H3", alignment: "right" },
      ]);
      assertEquals(result.rows, [
        { H1: "C1", H2: "C2", H3: "C3" },
        { H1: "C4", H2: "C5", H3: "C6" },
      ]);
    });

    test("table in CI", () => {
      const input = dedent(`
        -------------------
        H1   | H2  | H3  |
        -------------------
         C1  | C2  | C3  |
         C4  | C5  | C6  |
      `).trim();

      const [result] = parser.parse(input);

      assertEquals(result.headers, [
        { label: "H1", alignment: null },
        { label: "H2", alignment: null },
        { label: "H3", alignment: null },
      ]);
      assertEquals(result.rows, [
        { H1: "C1", H2: "C2", H3: "C3" },
        { H1: "C4", H2: "C5", H3: "C6" },
      ]);
    });
  });
});
