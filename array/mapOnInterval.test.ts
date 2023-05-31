import { assertEquals, test } from "../_deps/testing.ts";
import { mapOnInterval } from "./mapOnInterval.ts";

test("synchronous predicates", async () =>
  assertEquals(
    await mapOnInterval(["a", "b"], 1, (l: string) => l.toUpperCase()),
    ["A", "B"],
  ));

test("asynchronous predicates", async () => {
  const asyncPredicate = async (l: string) => await l.toUpperCase();

  assertEquals(
    await mapOnInterval(["a", "b"], 1, asyncPredicate),
    ["A", "B"],
  );
});
