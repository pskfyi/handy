import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { mapAtInterval } from "./mapAtInterval.ts";

Deno.test("timing.mapAtInterval", async () => {
  const predicate = (l: string) => l.toUpperCase();

  assertEquals(
    await mapAtInterval(1, ["a", "b"], predicate),
    ["A", "B"],
  );

  const asyncPredicate = async (l: string) => await l.toUpperCase();

  assertEquals(
    await mapAtInterval(1, ["a", "b"], asyncPredicate),
    ["A", "B"],
  );
});
