import { assertEquals } from "@std/assert";
import { it } from "@std/testing/bdd";
import { setNestedEntry } from "./setNestedEntry.ts";

const s = Symbol("");
const val = () => {};

it("creates medial objects", () =>
  assertEquals(
    setNestedEntry({}, ["a", 2, s], val),
    { a: { 2: { [s]: val } } },
  ));

it("overwrites", () =>
  assertEquals(
    setNestedEntry(
      { a: { b: 7 } },
      ["a", "b"],
      5,
    ),
    { a: { b: 5 } },
  ));
