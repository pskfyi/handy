import { assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { copy, paste } from "./mod.ts";

const ignore = Deno.build.os !== "darwin" && Deno.build.os !== "windows";

describe("copy & paste", { ignore }, () => {
  let clipboardCache: string;

  beforeAll(async () => {
    clipboardCache = await paste();
  });

  it("works together", async () => {
    await copy("Hello!");
    assertEquals(await paste(), "Hello!");
  });

  afterAll(async () => {
    await copy(clipboardCache);
  });
});
