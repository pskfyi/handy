import { assert, assertEquals } from "@std/assert";
import { describe, test } from "@std/testing/bdd";
import { evaluate } from "./mod.ts";

describe("evaluate TypeScript", () => {
  test("result.stdout", async () =>
    assertEquals((await evaluate("console.log('Hello!')")).stdout, "Hello!"));

  test("result.stderr", async () =>
    assert((await evaluate("throw new Error('')")).stderr.length));

  test("result.success", async () => {
    assert((await evaluate("throw new Error('')")).success === false);
    assert((await evaluate("invalid")).success === false);
    assert((await evaluate("const foo = ''")).success === true);
  });
});
