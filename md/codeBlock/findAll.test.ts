import { assertEquals, describe, it } from "../../_deps/testing.ts";
import { findAll } from "./findAll.ts";

describe("findAll", () => {
  it("returns blocks with locations", () =>
    assertEquals(
      findAll("foo\n\n    bar\n\n```baz\nqux\n```"),
      [
        ["    bar", { column: 1, line: 3, offset: 5 }],
        ["```baz\nqux\n```", { column: 1, line: 5, offset: 14 }],
      ],
    ));
});
