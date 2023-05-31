import { assertEquals, describe, it } from "../_deps/testing.ts";
import { mostConsecutive, sequences } from "./sequence.ts";

describe("sequences", () => {
  it("defaults to []", () => assertEquals(sequences("", ""), []));

  it('returns [] on ""', () => assertEquals(sequences("", "foo"), []));

  it("targets single chars", () =>
    assertEquals(sequences("o", "ofoo"), ["o", "oo"]));

  it("targets multiple chars", () =>
    assertEquals(sequences("fo", "fofofosho"), ["fofofo"]));

  it("targets regex", () =>
    assertEquals(sequences(/[^-]/, "123-45-678"), ["123", "45", "678"]));
});

describe("mostConsecutive", () => {
  it("defaults to 0", () => assertEquals(mostConsecutive("", ""), 0));

  it('returns 0 on ""', () => assertEquals(mostConsecutive("", "foo"), 0));

  it("targets single chars", () =>
    assertEquals(mostConsecutive("o", "ofoo"), 2));

  it("targets multiple chars", () =>
    assertEquals(mostConsecutive("fo", "fofofosho"), 3));
});
