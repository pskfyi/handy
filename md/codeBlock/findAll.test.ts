import { assertEquals, it } from "../../_deps/testing.ts";
import { findAll } from "./findAll.ts";

it("gets blocks & locations", () =>
  assertEquals(
    findAll("foo\n\n    bar\n\n```baz\nqux\n```"),
    [
      [
        { type: "indented", code: "bar" },
        { column: 1, line: 3, offset: 5 },
      ],
      [
        { type: "fenced", fence: "```", code: "qux", lang: "baz" },
        { column: 1, line: 5, offset: 14 },
      ],
    ],
  ));
