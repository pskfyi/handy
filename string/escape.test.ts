import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { escapeFull, escapeTerse } from "./escape.ts";

describe("escapeFull", () => {
  it("escapes newlines", () => {
    assertEquals(escapeFull("\n\n"), "\\n\\n");
    assertEquals(escapeFull("\r\r"), "\\r\\r");
    assertEquals(escapeFull("\r\n\r\n"), "\\r\\n\\r\\n");
  });

  it("escapes tabs", () => assertEquals(escapeFull("\t\t"), "\\t\\t"));
  it("escapes vertical tabs", () => assertEquals(escapeFull("\v\v"), "\\v\\v"));
  it("escapes form feeds", () => assertEquals(escapeFull("\f\f"), "\\f\\f"));
  it("escapes backspaces", () => assertEquals(escapeFull("\b\b"), "\\b\\b"));
});

describe("escapeTerse", () => {
  it("escapes newlines", () => {
    assertEquals(escapeTerse("\n\n"), "¶¶");
    assertEquals(escapeTerse("\r\r"), "␍␍");
    assertEquals(escapeTerse("\r\n\r\n"), "␍¶␍¶");
  });

  it("escapes tabs", () => assertEquals(escapeTerse("\t\t"), "⇥⇥"));
  it("escapes vertical tabs", () => assertEquals(escapeTerse("\v\v"), "␋␋"));
  it("escapes form feeds", () => assertEquals(escapeTerse("\f\f"), "␌␌"));
  it("escapes backspaces", () => assertEquals(escapeTerse("\b\b"), "␈␈"));
});
