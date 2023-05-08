import { FIXTURE_DIR } from "../_constants.ts";
import { resolve } from "../_deps/path.ts";
import { assertEquals, assertRejects, describe, it } from "../_deps/testing.ts";
import { JsonFileHandler } from "./fileHandler.ts";

const valid = resolve(FIXTURE_DIR, "json", "valid.json");
const invalid = resolve(FIXTURE_DIR, "json", "invalid.json");

describe(".read()", () => {
  it("returns stdout", async () =>
    assertEquals(
      await new JsonFileHandler().read(valid),
      { foo: "bar" },
    ));

  it("throws on invalid file content", async () =>
    void await assertRejects(
      () => new JsonFileHandler().read(invalid),
      SyntaxError,
    ));
});

describe(".write()", () => {
  // TODO: stub Deno.writeTextFile()
});
