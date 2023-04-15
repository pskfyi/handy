import { assertEquals, describe, it } from "../../deps/testing.ts";
import { findAll } from "./findAll.ts";

describe("findAll", () => {
  it("finds all code blocks in a string", () =>
    assertEquals(
      findAll("foo\n\n    bar\n\n```baz\nqux\n```"),
      ["    bar", "```baz\nqux\n```"],
    ));
});
