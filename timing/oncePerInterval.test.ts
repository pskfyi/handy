import { assertEquals, describe, it } from "../deps/testing.ts";
import { oncePerInterval } from "./oncePerInterval.ts";

describe("timing.oncePerInterval", () => {
  it("works with synchronous predicates", async () =>
    assertEquals(
      await oncePerInterval(1, ["a", "b"], (l: string) => l.toUpperCase()),
      ["A", "B"],
    ));

  it("works with asynchronous predicates", async () => {
    const asyncPredicate = async (l: string) => await l.toUpperCase();

    assertEquals(
      await oncePerInterval(1, ["a", "b"], asyncPredicate),
      ["A", "B"],
    );
  });
});
