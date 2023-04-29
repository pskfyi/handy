import { assert, assertEquals, describe, it } from "../_deps/testing.ts";
import { evaluate } from "./evaluate.ts";

describe("evaluate TypeScript", () => {
  it("returns stdout", async () =>
    assertEquals((await evaluate("console.log('Hello!')")).stdout, "Hello!"));

  it("returns stderr", async () =>
    assert((await evaluate("throw new Error('')")).stderr.length));

  describe("result.success", () => {
    it("is false when code throws ", async () =>
      assert((await evaluate("throw new Error('')")).success === false));

    it("is false on invalid input", async () =>
      assert((await evaluate("invalid")).success === false));

    it("is false on invalid types", async () =>
      assert((await evaluate("const foo: number = ''")).success === false));

    it("optionally ignores types", async () =>
      void assert(
        (await evaluate("const foo: number = ''", { typeCheck: false }))
          .success,
      ));
  });

  it("respects ts-ignore comments", async () =>
    void assert(
      (await evaluate("// @ts-ignore\n" + "const foo: number = ''")).success,
    ));
});
