import { assertEquals, describe, it } from "../deps/testing.ts";
import { smallest } from "./smallest.ts";

describe("smallest", () => {
  it("finds the shortest strings in an Array", () => {
    assertEquals(smallest("length", ["a", "bb", "c", "ddd"]), ["a", "c"]);
  });

  it("finds the shortest strings in a Set", () => {
    assertEquals(
      smallest("length", new Set(["a", "bb", "c", "ddd"])),
      ["a", "c"],
    );
  });

  it("finds the smallest Set from a collection of Sets", () => {
    assertEquals(
      smallest("size", [new Set([1, 2]), new Set([1, 2, 3])]),
      [new Set([1, 2])],
    );
  });

  it("has special handling for items with the property 'length'", () => {
    assertEquals(smallest(["a", "bb", "c", "ddd"]), ["a", "c"]);
  });
});
