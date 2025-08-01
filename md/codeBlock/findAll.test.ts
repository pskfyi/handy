import { assertEquals } from "@std/assert";
import { it } from "@std/testing/bdd";
import { findAll } from "./findAll.ts";

it("gets blocks & locations", () =>
  assertEquals(
    findAll("foo\n\n    bar\n\n```baz\nqux\n```"),
    [
      [
        { type: "indented", code: "bar\n" },
        { column: 1, line: 3, offset: 5 },
      ],
      [
        { type: "fenced", fence: "```", code: "qux", lang: "baz" },
        { column: 1, line: 5, offset: 14 },
      ],
    ],
  ));
