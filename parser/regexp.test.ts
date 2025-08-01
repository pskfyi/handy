import { assertThrows } from "@std/assert";
import { test } from "@std/testing/bdd";
import { assertParseResult } from "./asserts.ts";
import { regexp } from "./regexp.ts";

test("one input", () => assertParseResult(regexp(/\S/).match.parse("X"), "X"));

test("multiple inputs", () => {
  const parser = regexp(/\s/, /\d/).match;

  assertParseResult(parser.parse(" "), " ");
  assertParseResult(parser.parse("1"), "1");

  assertThrows(() => parser.parse("A"));
});
