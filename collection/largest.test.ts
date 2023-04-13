import { assertEquals, describe, it } from "../deps/testing.ts";
import { largest } from "./largest.ts";

describe("largest", () => {
  it("finds the longest strings in an Array", () => {
    assertEquals(largest("length", ["a", "bbb", "cc", "ddd"]), ["bbb", "ddd"]);
  });

  it("finds the longest strings in a Set", () => {
    assertEquals(
      largest("length", new Set(["a", "bbb", "cc", "ddd"])),
      ["bbb", "ddd"],
    );
  });

  it("finds the largest Set from a collection of Sets", () => {
    assertEquals(
      largest("size", [new Set([1, 2]), new Set([1, 2, 3])]),
      [new Set([1, 2, 3])],
    );
  });

  it("has special handling for items with the property 'length'", () => {
    assertEquals(largest(["a", "bbb", "cc", "ddd"]), ["bbb", "ddd"]);
  });
});
