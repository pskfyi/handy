import { assert, assertEquals } from "@std/assert";
import { test } from "@std/testing/bdd";
import { create } from "./create.ts";

test("defaults", () =>
  assertEquals(
    create("const a = 1;"),
    "    const a = 1;",
  ));

test("options.lang adds fences", () =>
  assert(
    create("const a: number = 1;", { lang: "ts" })
      .startsWith("```"),
  ));

test("options.meta adds fences", () =>
  assertEquals(
    create("const a: number = 1;", { meta: "some info" }),
    "```nocode some info\nconst a: number = 1;\n```",
  ));
