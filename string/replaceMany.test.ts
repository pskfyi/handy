import { describe, it } from "@std/testing/bdd";
import { replaceMany } from "./replaceMany.ts";
import { assertEquals } from "@std/assert";

describe("replaceMany", () => {
  it("processes multiple find/replace pairs", () => {
    const input = "Hello, world!";
    const replacements = {
      "Hello": "Goodbye",
      "world": "space",
      "!": "?",
    };

    const expected = "Goodbye, space?";
    const result = replaceMany(input, replacements);

    assertEquals(result, expected);
  });

  it("replaces all occurrences", () => {
    const input = "ABC 123 ABC 456";
    const replacements = {
      "A": "X",
      "B": "Y",
      "C": "Z",
    };

    const expected = "XYZ 123 XYZ 456";
    const result = replaceMany(input, replacements);

    assertEquals(result, expected);
  });

  it("is case sensitive by default", () => {
    const input = "Case Sensitive";
    const replacements = {
      "Case": "Hello",
      "sensitive": "World!",
    };

    const expected = "Hello Sensitive";
    const result = replaceMany(input, replacements);

    assertEquals(result, expected);
  });

  it("is optionally case insensitive", () => {
    const input = "Case Insensitive";
    const replacements = {
      "case": "Hello",
      "insensitive": "World!",
    };

    const expected = "Hello World!";
    const result = replaceMany(input, replacements, { caseSensitive: false });

    assertEquals(result, expected);
  });
});
