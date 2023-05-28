import { assertEquals, assertThrows, describe, it } from "../_deps/testing.ts";
import { Text } from "./Text.ts";

describe("input", () => {
  it("is the input string", () => {
    assertEquals(new Text("a").input, "a");
  });
});

describe("value", () => {
  it("equals .input", () => {
    const text = new Text("a");
    assertEquals(text.value, text.input);
  });
});

describe("length", () => {
  it("measures .input", () => {
    assertEquals(new Text("a").length, 1);
    assertEquals(new Text("ab").length, 2);
    assertEquals(new Text("").length, 0);
  });
});

describe("lines", () => {
  it('handles ""', () => {
    assertEquals(new Text("").lines, [""]);
  });

  it("handles newlines", () => {
    assertEquals(new Text("ab\nc").lines, ["ab\n", "c"]);
    assertEquals(new Text("ab\rc").lines, ["ab\r", "c"]);
    assertEquals(new Text("ab\r\nc").lines, ["ab\r\n", "c"]);
    assertEquals(new Text("ab\n\nc").lines, ["ab\n", "\n", "c"]);
    assertEquals(new Text("ab\r\rc").lines, ["ab\r", "\r", "c"]);
    assertEquals(new Text("ab\r\n\r\nc").lines, ["ab\r\n", "\r\n", "c"]);
  });

  it("handles the examples", () => {
    assertEquals(new Text("a\n\nb").lines, ["a\n", "\n", "b"]);
  });
});

describe("positionAt()", () => {
  describe("invalid values", () => {
    const text = new Text("a");

    it("throws if too large", () =>
      void assertThrows(() => text.positionAt(2)));

    it("throws if too small", () =>
      void assertThrows(() => text.positionAt(-2)));

    it("throws if NaN", () => void assertThrows(() => text.positionAt(NaN)));

    it("throws if float", () => void assertThrows(() => text.positionAt(0.1)));
  });

  describe("valid values", () => {
    it('handles ""', () => {
      assertEquals(new Text("").positionAt(0), 0);
      assertEquals(new Text("").positionAt(-0), 0);
    });

    it("can locate end of text", () => {
      assertEquals(new Text("a\nb").positionAt(-0), 3);
    });

    it("handles newlines", () => {
      assertEquals(new Text("a\nb").positionAt(2), 2);
      assertEquals(new Text("a\rb").positionAt(2), 2);
      assertEquals(new Text("a\r\nb").positionAt(3), 3);
    });

    it("handles the examples", () => {
      assertEquals(new Text("a\n\nb").positionAt(3), 3);
    });
  });
});

describe("locationAt()", () => {
  describe("invalid values", () => {
    const text = new Text("a");

    it("throws if too large", () =>
      void assertThrows(() => text.locationAt(2)));

    it("throws if too small", () =>
      void assertThrows(() => text.locationAt(-2)));

    it("throws if NaN", () => void assertThrows(() => text.locationAt(NaN)));

    it("throws if float", () => void assertThrows(() => text.locationAt(0.1)));
  });

  describe("valid values", () => {
    it('handles ""', () => {
      assertEquals(
        new Text("").locationAt(0),
        { offset: 0, line: 1, column: 1 },
      );
      assertEquals(
        new Text("").locationAt(-0),
        { offset: 0, line: 1, column: 1 },
      );
    });

    it("can locate end of text", () => {
      assertEquals(
        new Text("a\nb").locationAt(-0),
        { offset: 3, line: 2, column: 2 },
      );
    });

    it("handles newlines", () => {
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

    it("handles the examples", () => {
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
