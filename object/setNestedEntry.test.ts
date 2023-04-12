import { assertEquals, describe } from "../deps/testing.ts";
import { setNestedEntry } from "./setNestedEntry.ts";

describe("object.setNestedEntry", () => {
  const s = Symbol("");
  const val = () => {};

  assertEquals(
    setNestedEntry({}, ["a", 2, s], val),
    { a: { 2: { [s]: val } } },
  );
  assertEquals(
    setNestedEntry(
      { a: { b: 7 } },
      ["a", "b"],
      5,
    ),
    { a: { b: 5 } },
  );
});
