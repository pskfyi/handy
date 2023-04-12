import { assertEquals, describe, it } from "../deps/testing.ts";
import { setNestedEntry } from "./setNestedEntry.ts";

const s = Symbol("");
const val = () => {};

describe("object.setNestedEntry", () => {
  it("creates intermediate objects", () =>
    assertEquals(
      setNestedEntry({}, ["a", 2, s], val),
      { a: { 2: { [s]: val } } },
    ));

  it("overwrites existing values", () =>
    assertEquals(
      setNestedEntry(
        { a: { b: 7 } },
        ["a", "b"],
        5,
      ),
      { a: { b: 5 } },
    ));
});
