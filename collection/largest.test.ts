import { assertEquals, describe, it } from "../_deps/testing.ts";
import { largest } from "./largest.ts";

describe("largest", () => {
  it("finds longest strings in an Array", () => {
    assertEquals(largest("length", ["a", "bbb", "cc", "ddd"]), ["bbb", "ddd"]);
  });

  it("finds longest strings in a Set", () => {
    assertEquals(
      largest("length", new Set(["a", "bbb", "cc", "ddd"])),
      ["bbb", "ddd"],
    );
  });

  it("finds largest Set among Sets", () => {
    assertEquals(
      largest("size", [new Set([1, 2]), new Set([1, 2, 3])]),
      [new Set([1, 2, 3])],
    );
  });

  it("handles length property specially", () => {
    assertEquals(largest(["a", "bbb", "cc", "ddd"]), ["bbb", "ddd"]);
  });
});
