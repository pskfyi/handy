import { assertEquals } from "../deps/testing.ts";
import { setNestedEntry } from "./setNestedEntry.ts";

Deno.test("object.setNestedEntry", async () => {
  const s = Symbol("");
  const val = () => {};

  assertEquals(
    await setNestedEntry({}, ["a", 2, s], val),
    { a: { 2: { [s]: val } } },
  );
  assertEquals(
    await setNestedEntry(
      { a: { b: 7 } },
      ["a", "b"],
      5,
    ),
    { a: { b: 5 } },
  );
});
