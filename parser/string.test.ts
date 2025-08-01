import { assertThrows } from "@std/assert";
import { test } from "@std/testing/bdd";
import { assertParseResult } from "./asserts.ts";
import { string } from "./string.ts";

test("one input", () => assertParseResult(string("X").parse("X"), "X"));

test("multiple inputs", () => {
  const parser = string("X", "Y", "Z");

  assertParseResult(parser.parse("X"), "X");
  assertParseResult(parser.parse("Y"), "Y");
  assertParseResult(parser.parse("Z"), "Z");

  assertThrows(() => parser.parse("A"));
});
