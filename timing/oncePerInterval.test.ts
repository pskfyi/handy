import { assertEquals } from "../deps/testing.ts";
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
