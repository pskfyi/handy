import { assertEquals, test } from "../_deps/testing.ts";
import { smallest } from "./smallest.ts";

test("Array of strings", () => {
  assertEquals(smallest("length", ["a", "bb", "c", "ddd"]), ["a", "c"]);
});

test("Set of strings", () => {
  assertEquals(
    smallest("length", new Set(["a", "bb", "c", "ddd"])),
    ["a", "c"],
  );
});

test("Array of Sets", () => {
  assertEquals(
    smallest("size", [new Set([1, 2]), new Set([1, 2, 3])]),
    [new Set([1, 2])],
  );
});

test(".length handling", () => {
  assertEquals(smallest(["a", "bb", "c", "ddd"]), ["a", "c"]);
});
