import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { oncePerInterval } from "./oncePerInterval.ts";

Deno.test("timing.oncePerInterval", async () => {
  const predicate = (l: string) => l.toUpperCase();

  assertEquals(
    await oncePerInterval(1, ["a", "b"], predicate),
    ["A", "B"],
  );

  const asyncPredicate = async (l: string) => await l.toUpperCase();

  assertEquals(
    await oncePerInterval(1, ["a", "b"], asyncPredicate),
    ["A", "B"],
  );
});
