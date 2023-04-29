import { FIXTURE_DIR } from "../_constants.ts";
import { resolve } from "../_deps/path.ts";
import { assertEquals, assertRejects, describe, it } from "../_deps/testing.ts";
import { CmdError } from "../cli/cmd.ts";
import { TypeScriptFileHandler } from "./fileHandler.ts";

const valid = resolve(FIXTURE_DIR, "ts", "valid.ts");
const invalid = resolve(FIXTURE_DIR, "ts", "invalid.ts");
const invalidTypes = resolve(FIXTURE_DIR, "ts", "invalidTypes.ts");
const throws = resolve(FIXTURE_DIR, "ts", "throws.ts");

describe("TypeScriptFileHandler.prototype.evaluate()", () => {
  it("returns stdout", async () =>
    assertEquals(
      await new TypeScriptFileHandler().evaluate(valid),
      "Hello",
    ));

  it("throws when code throws", async () =>
    void await assertRejects(
      () => new TypeScriptFileHandler().evaluate(throws),
      CmdError,
    ));

  it("throws on invalid input", async () =>
    void await assertRejects(
      () => new TypeScriptFileHandler().evaluate(invalid),
      CmdError,
    ));

  describe("type checking", () => {
    it("is enabled by default", async () =>
      void await assertRejects(
        () => new TypeScriptFileHandler().evaluate(invalidTypes),
      ));

    it("can be disabled", async () =>
      void assertEquals(
        await new TypeScriptFileHandler({ typeCheck: false })
          .evaluate(invalidTypes),
        "Hello",
      ));
  });
});
