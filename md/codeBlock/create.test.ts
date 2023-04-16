import { assert, assertEquals, describe, it } from "../../_deps/testing.ts";
import { create } from "./create.ts";

describe("create", () => {
  it("defaults to indented code blocks", () =>
    assertEquals(
      create("const a = 1;"),
      "    const a = 1;",
    ));

  describe("options.lang", () => {
    it("always fences", () =>
      assert(
        create("const a: number = 1;", { lang: "ts" })
          .startsWith("```"),
      ));
  });

  describe("options.meta", () => {
    it("always fences", () =>
      assertEquals(
        create("const a: number = 1;", { meta: "some info" }),
        "```nocode some info\nconst a: number = 1;\n```",
      ));
  });
});
