import { assertEquals, assertThrows } from "@std/assert";
import { describe, test } from "@std/testing/bdd";
import { Text } from "./Text.ts";

describe(".input is the input", () => assertEquals(new Text("a").input, "a"));

describe(".value is .input", () => {
  const text = new Text("a");
  assertEquals(text.value, text.input);
});

describe(".length measures .input", () => {
  assertEquals(new Text("a").length, 1);
  assertEquals(new Text("ab").length, 2);
  assertEquals(new Text("").length, 0);
});

describe("lines", () => {
  test('""', () => assertEquals(new Text("").lines, [""]));

  test("newlines", () => {
    assertEquals(new Text("ab\nc").lines, ["ab\n", "c"]);
    assertEquals(new Text("ab\rc").lines, ["ab\r", "c"]);
    assertEquals(new Text("ab\r\nc").lines, ["ab\r\n", "c"]);
    assertEquals(new Text("ab\n\nc").lines, ["ab\n", "\n", "c"]);
    assertEquals(new Text("ab\r\rc").lines, ["ab\r", "\r", "c"]);
    assertEquals(new Text("ab\r\n\r\nc").lines, ["ab\r\n", "\r\n", "c"]);
  });

  test("the examples", () =>
    assertEquals(new Text("a\n\nb").lines, ["a\n", "\n", "b"]));
});

describe("positionAt()", () => {
  describe("invalid values throw", () => {
    const text = new Text("a");

    assertThrows(() => text.positionAt(2));
    assertThrows(() => text.positionAt(-2));
    assertThrows(() => text.positionAt(NaN));
    assertThrows(() => text.positionAt(0.1));
  });

  describe("valid values", () => {
    test('""', () => {
      assertEquals(new Text("").positionAt(0), 0);
      assertEquals(new Text("").positionAt(-0), 0);
    });

    test("-0 is text end", () =>
      assertEquals(new Text("a\nb").positionAt(-0), 3));

    test("newlines", () => {
      assertEquals(new Text("a\nb").positionAt(2), 2);
      assertEquals(new Text("a\rb").positionAt(2), 2);
      assertEquals(new Text("a\r\nb").positionAt(3), 3);
    });

    test("the examples", () =>
      assertEquals(new Text("a\n\nb").positionAt(3), 3));
  });
});

describe("locationAt()", () => {
  describe("invalid values throw", () => {
    const text = new Text("a");

    test("value too large", () => void assertThrows(() => text.locationAt(2)));
    test("value too small", () => void assertThrows(() => text.locationAt(-2)));
    test("value is NaN", () => void assertThrows(() => text.locationAt(NaN)));
    test("value is float", () => void assertThrows(() => text.locationAt(0.1)));
  });

  describe("valid values", () => {
    test('""', () => {
      assertEquals(
        new Text("").locationAt(0),
        { offset: 0, line: 1, column: 1 },
      );
      assertEquals(
        new Text("").locationAt(-0),
        { offset: 0, line: 1, column: 1 },
      );
    });

    test("-0 is text end", () => {
      assertEquals(
        new Text("a\nb").locationAt(-0),
        { offset: 3, line: 2, column: 2 },
      );
    });

    test("newlines", () => {
      assertEquals(
        new Text("a\nb").locationAt(2),
        { offset: 2, line: 2, column: 1 },
      );
      assertEquals(
        new Text("a\rb").locationAt(2),
        { offset: 2, line: 2, column: 1 },
      );
      assertEquals(
        new Text("a\r\nb").locationAt(3),
        { offset: 3, line: 2, column: 1 },
      );
    });

    test("the examples", () => {
      assertEquals(
        new Text("a\n\nb").locationAt(3),
        { offset: 3, line: 3, column: 1 },
      );
      assertEquals(
        new Text("a\n\nb").locationAt(4),
        { offset: 4, line: 3, column: 2 },
      );
      assertEquals(
        new Text("a\n\nb").locationAt(-0),
        { offset: 4, line: 3, column: 2 },
      );
      assertEquals(
        new Text("a\n\nb").locationAt(-1),
        { offset: 3, line: 3, column: 1 },
      );
    });
  });
});
