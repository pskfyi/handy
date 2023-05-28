import { assert, test } from "../_deps/testing.ts";
import { ArrayParser } from "./Parser.ts";
import { assertParseResult } from "./asserts.ts";
import { sequence } from "./sequence.ts";
import { string } from "./string.ts";

const seq = sequence("#", /\d+/, string("X").oneOrMore);

test("class()", () => assert(seq instanceof ArrayParser));

test("parse()", () => {
  assertParseResult(seq.parse("#123XXX"), ["#", "123", ["X", "X", "X"]]);
  assertParseResult(seq.flat.parse("#123XXX"), ["#", "123", "X", "X", "X"]);
  assertParseResult(seq.flat.join().parse("#123XXX"), "#123XXX");
});

test("ignore behavior", () => {
  const parser = sequence("A", string("B").ignore, "C");

  assertParseResult(parser.parse("ABC"), ["A", "C"]);
});
