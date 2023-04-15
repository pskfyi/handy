import { assertEquals, describe, it } from "../deps/testing.ts";
import { smallest } from "./smallest.ts";

describe("smallest", () => {
  it("finds shortest strings in an Array", () => {
    assertEquals(smallest("length", ["a", "bb", "c", "ddd"]), ["a", "c"]);
  });

  it("finds shortest strings in a Set", () => {
    assertEquals(
      smallest("length", new Set(["a", "bb", "c", "ddd"])),
      ["a", "c"],
    );
  });

  it("finds smallest Set from among Sets", () => {
    assertEquals(
      smallest("size", [new Set([1, 2]), new Set([1, 2, 3])]),
      [new Set([1, 2])],
    );
  });

  it("handles length property specially", () => {
    assertEquals(smallest(["a", "bb", "c", "ddd"]), ["a", "c"]);
  });
});
