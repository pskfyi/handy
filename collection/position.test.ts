import {
  assert,
  assertEquals,
  assertThrows,
  describe,
  it,
  test,
} from "../_deps/testing.ts";

import * as position from "./position.ts";

describe("invalid value handling", () => {
  it("rejects value too large", () => {
    assert(!position.isPosition(1, []));
    assertThrows(() => position.assert(1, []));
    assertThrows(() => position.toPosition(1, []));
    assertThrows(() => position.toPosition(2, "a"));
    assertThrows(() => position.toPosition(3, new Uint8Array(2)));
  });

  it("rejects -value too small", () => {
    assert(!position.isPosition(-1, []));
    assertThrows(() => position.assert(-1, []));
    assertThrows(() => position.toPosition(-1, []));
    assertThrows(() => position.toPosition(-2, "a"));
    assertThrows(() => position.toPosition(-3, new Uint8Array(2)));
  });

  it("rejects NaN", () => {
    assert(!position.isPosition(NaN, []));
    assertThrows(() => position.assert(NaN, []));
    assertThrows(() => position.toPosition(NaN, []));
    assertThrows(() => position.toPosition(NaN, "a"));
    assertThrows(() => position.toPosition(NaN, new Uint8Array(2)));
  });

  it("rejects floats", () => {
    assert(!position.isPosition(0.1, []));
    assertThrows(() => position.assert(0.1, [""]));
    assertThrows(() => position.toPosition(0.1, [""]));
    assertThrows(() => position.toPosition(0.5, "a"));
    assertThrows(() => position.toPosition(1.9, new Uint8Array(2)));
  });
});

describe("valid value handling", () => {
  it("always accepts 0", () => {
    position.assert(0, []);
    position.isPosition(0, []);
    position.toPosition(0, []);
    position.toPosition(0, "");
    position.toPosition(0, new Uint8Array());
  });

  it("always accepts -0", () => {
    position.assert(-0, []);
    position.isPosition(-0, []);
    position.toPosition(-0, []);
    position.toPosition(-0, "");
    position.toPosition(-0, new Uint8Array());
  });

  it("forwards positive values", () => {
    assertEquals(position.toPosition(1, [""]), 1);
    assertEquals(position.toPosition(1, [""]), 1);
    assertEquals(position.toPosition(2, "abcd"), 2);
    assertEquals(position.toPosition(3, new Uint8Array(3)), 3);
  });

  it("wraps negative values", () => {
    assertEquals(position.toPosition(-1, [""]), 0);
    assertEquals(position.toPosition(-1, [""]), 0);
    assertEquals(position.toPosition(-1, [""]), 0);
    assertEquals(position.toPosition(-2, "abc"), 1);
    assertEquals(position.toPosition(-4, new Uint8Array(10)), 6);
  });

  it("equates -0 and length", () => {
    assertEquals(position.toPosition(-0, [""]), 1);
    assertEquals(position.toPosition(-0, [""]), 1);
    assertEquals(position.toPosition(-0, [""]), 1);
    assertEquals(position.toPosition(-0, "abc"), 3);
    assertEquals(position.toPosition(-0, new Uint8Array(10)), 10);
  });
});

test("position.next", () => {
  assertEquals(position.next(0, [""]), 1);
  assertEquals(position.next(0, []), null);
});

test(".previous", () => {
  assertEquals(position.previous(1), 0);
  assertEquals(position.previous(0), null);
});
