import {
  assert,
  assertEquals,
  assertRejects,
  describe,
  test,
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
const logs = 'console.log("logged")';

describe("evaluate", () => {
  test("no lang", () => {
    void assertRejects(
      async () => void await evaluate(indented.create(throws)),
      IndentedCodeBlockError,
    );

    void assertRejects(
      async () => void await evaluate(fenced.create(throws)),
      NoLanguageError,
    );
  });

  test("unknown lang", () =>
    void assertRejects(
      async () => void await evaluate(fenced.create(throws, { lang: "ZZZ" })),
      UnknownLanguageError,
    ));

  test("typescript", async () => {
    const result = await evaluate(fenced.create(throws, { lang: "ts" }));

    assertEquals(result.success, false);
    assertEquals(result.code, 1);
    assertEquals(result.stdout, "");
    assert(result.stderr.includes("throw new Error()"));
  });

  test("javascript", async () => {
    assertEquals(await evaluate(fenced.create(logs, { lang: "js" })), {
      success: true,
      code: 0,
      stderr: "",
      stdout: "logged",
    });
  });
});

describe("evaluateAll", () => {
  test("indented code blocks", async () => {
    const results = await evaluateAll(
      indented.create(throws) + "\n---\n" +
        indented.create(throws) + "\n",
    );

    for (const [details, , result] of results) {
      assert(details.type === "indented");
      assert(result instanceof IndentedCodeBlockError);
    }
  });

  test("error gathering", async () => {
    const results = await evaluateAll(
      fenced.create(throws) + "\n" +
        fenced.create(throws) + "\n",
    );

    for (const [details, , err] of results) {
      assert(details.type === "fenced");
      assert(err instanceof NoLanguageError);
    }

    const results2 = await evaluateAll(
      fenced.create(throws, { lang: "py" }) + "\n" +
        fenced.create(throws, { lang: "rs" }) + "\n",
    );

    for (const [details, , err] of results2) {
      assert(details.type === "fenced");
      assert(err instanceof UnknownLanguageError);
    }
  });

  test("typescript", async () => {
    const results = await evaluateAll(
      fenced.create(throws, { lang: "ts" }) + "\n" +
        fenced.create(`console.log('"Hello!"')`, { lang: "ts" }) + "\n",
    );

    for (const [details, , result] of results) {
      assert(details.type === "fenced");
      assert(!(result instanceof Error));
      if (!result.success) {
        assertEquals(result.code, 1);
        assertEquals(result.stdout, "");
        assert(result.stderr.includes("throw new Error()"));
      } else {
        assertEquals(result.code, 0);
        assertEquals(result.stderr, "");
        assertEquals(result.stdout, '"Hello!"');
      }
    }
  });
});
