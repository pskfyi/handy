import {
  afterAll,
  assertEquals,
  beforeAll,
  describe,
  it,
} from "../_deps/testing.ts";
import { copy, paste } from "./clipboard.ts";

describe("copy & paste", () => {
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
