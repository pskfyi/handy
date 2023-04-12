import { assertEquals, describe, it } from "../deps/testing.ts";
import { oncePerInterval } from "./oncePerInterval.ts";

describe("timing.oncePerInterval", () => {
  it(
    "works with synchronous predicates",
    async () => {
      const predicate = (l: string) => l.toUpperCase();

      assertEquals(
        await oncePerInterval(1, ["a", "b"], predicate),
        ["A", "B"],
      );
    },
  );

  it(
    "works with asynchronous predicates",
    async () => {
      const asyncPredicate = async (l: string) => await l.toUpperCase();

      assertEquals(
        await oncePerInterval(1, ["a", "b"], asyncPredicate),
        ["A", "B"],
      );
    },
  );
});
