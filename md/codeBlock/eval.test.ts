import {
  assert,
  assertEquals,
  assertRejects,
  describe,
  it,
} from "../../_deps/testing.ts";
import {
  evaluate,
  evaluateAll,
  IndentedCodeBlockError,
  NoLanguageError,
  UnknownLanguageError,
} from "./eval.ts";
import * as fenced from "./fenced.ts";
import * as indented from "./indented.ts";

const throws = "throw new Error()";

describe("evaluate", () => {
  describe("indented code blocks", () => {
    it("throws custom error", () =>
      void assertRejects(
        async () => void await evaluate(indented.create(throws)),
        IndentedCodeBlockError,
      ));
  });

  it("throws custom error on fenced blocks w/o lang", () =>
    void assertRejects(
      async () => void await evaluate(fenced.create(throws)),
      NoLanguageError,
    ));

  it("throws custom error on fenced blocks w/ unknown lang", () =>
    void assertRejects(
      async () => void await evaluate(fenced.create(throws, { lang: "js" })),
      UnknownLanguageError,
    ));

  it("evaluates typescript", async () => {
    const result = await evaluate(fenced.create(throws, { lang: "ts" }));

    assertEquals(result.success, false);
    assertEquals(result.exitCode, 1);
    assertEquals(result.stdout, "");
    assert(result.stderr.includes("throw new Error()"));
  });
});

describe("evaluateAll", () => {
  describe("indented code blocks", () => {
    it("gathers custom error", async () => {
      const results = await evaluateAll(
        indented.create(throws) + "\n---\n" +
          indented.create(throws) + "\n",
      );

      assertEquals(results.size, 2);
      for (const [node, result] of results) {
        assert(node.type === "indented");
        assert(result instanceof IndentedCodeBlockError);
      }
    });
  });

  describe("fenced code blocks", () => {
    it("gathers custom error w/o lang", async () => {
      const results = await evaluateAll(
        fenced.create(throws) + "\n" +
          fenced.create(throws) + "\n",
      );

      assertEquals(results.size, 2);
      for (const [details, err] of results) {
        assert(details.type === "fenced");
        assert(err instanceof NoLanguageError);
      }
    });

    it("gathers custom error w/ unknown lang", async () => {
      const results = await evaluateAll(
        fenced.create(throws, { lang: "py" }) + "\n" +
          fenced.create(throws, { lang: "rs" }) + "\n",
      );

      assertEquals(results.size, 2);
      for (const [details, err] of results) {
        assert(details.type === "fenced");
        assert(err instanceof UnknownLanguageError);
      }
    });

    it("evaluates typescript", async () => {
      const results = await evaluateAll(
        fenced.create(throws, { lang: "ts" }) + "\n" +
          fenced.create(throws, { lang: "ts" }) + "\n",
      );

      assertEquals(results.size, 2);
      for (const [node, result] of results) {
        assert(node.type === "fenced");
        assert(!(result instanceof Error));
        assertEquals(result.success, false);
        assertEquals(result.exitCode, 1);
        assertEquals(result.stdout, "");
        assert(result.stderr.includes("throw new Error()"));
      }
    });
  });
});
