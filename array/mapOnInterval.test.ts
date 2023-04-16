import { assertEquals, describe, it } from "../_deps/testing.ts";
import { mapOnInterval } from "./mapOnInterval.ts";

describe("array.mapOnInterval", () => {
  it("works with synchronous predicates", async () =>
    assertEquals(
      await mapOnInterval(["a", "b"], 1, (l: string) => l.toUpperCase()),
      ["A", "B"],
    ));

  it("works with asynchronous predicates", async () => {
    const asyncPredicate = async (l: string) => await l.toUpperCase();

    assertEquals(
      await mapOnInterval(["a", "b"], 1, asyncPredicate),
      ["A", "B"],
    );
  });
});
