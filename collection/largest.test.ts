import { assertEquals, test } from "../_deps/testing.ts";
import { largest } from "./largest.ts";

test("w/ Array", () =>
  assertEquals(largest("length", ["a", "bbb", "cc", "ddd"]), ["bbb", "ddd"]));

test("w/ Set", () =>
  assertEquals(
    largest("length", new Set(["a", "bbb", "cc", "ddd"])),
    ["bbb", "ddd"],
  ));

test("w/ Array of Sets", () =>
  assertEquals(
    largest("size", [new Set([1, 2]), new Set([1, 2, 3])]),
    [new Set([1, 2, 3])],
  ));

test(".length handling", () =>
  assertEquals(largest(["a", "bbb", "cc", "ddd"]), ["bbb", "ddd"]));
