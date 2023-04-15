import { assertEquals, describe, it } from "../deps/testing.ts";
import { mostConsecutive, sequences } from "./sequence.ts";

describe("sequences", () => {
  it("defaults to []", () => assertEquals(sequences("", ""), []));

  it("returns [] on empty target", () =>
    assertEquals(sequences("", "foo"), []));

  it("targets single characters", () =>
    assertEquals(sequences("o", "ofoo"), ["o", "oo"]));

  it("targets multiple characters", () =>
    assertEquals(sequences("fo", "fofofosho"), ["fofofo"]));

  it("targets regex", () =>
    assertEquals(sequences(/[^-]/, "123-45-678"), ["123", "45", "678"]));
});

describe("mostConsecutive", () => {
  it("defaults to 0", () => assertEquals(mostConsecutive("", ""), 0));

  it("returns 0 on empty target", () =>
    assertEquals(mostConsecutive("", "foo"), 0));

  it("targets single characters", () =>
    assertEquals(mostConsecutive("o", "ofoo"), 2));

  it("targets multiple characters", () =>
    assertEquals(mostConsecutive("fo", "fofofosho"), 3));
});
