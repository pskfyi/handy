import { assertEquals, assertThrows, describe, it } from "../_deps/testing.ts";
import { location } from "./location.ts";

describe("invalid locations", () => {
  it("throws if index > string.length", () =>
    void assertThrows(() => location("a", 2)));

  it("throws if -index > string.length + 1", () =>
    void assertThrows(() => location("a", -3)));
});

describe("location.column", () => {
  it('handles ""', () => {
    assertEquals(location("", 0).column, 1);
    assertEquals(location("", -1).column, 1);
  });

  it("starts at column 1", () => assertEquals(location("a", 0).column, 1));

  it("can locate end of text", () => assertEquals(location("a", 1).column, 2));

  it("finds a column within a line", () => {
    assertEquals(location("a\nb", 2).column, 1);
    assertEquals(location("a\rb", 2).column, 1);
    assertEquals(location("a\r\nb", 2).column, 1);
  });

  it("finds the last column", () => {
    assertEquals(location("a\nb", -1).column, 2);
    assertEquals(location("a\rb", -1).column, 2);
    assertEquals(location("a\r\nb", -1).column, 2);
  });
});

describe("location.line", () => {
  it('handles ""', () => {
    assertEquals(location("", 0).line, 1);
    assertEquals(location("", -1).line, 1);
  });

  it("starts at line 1", () => assertEquals(location("a", 0).line, 1));

  it("handles newline characters", () => {
    assertEquals(location("a\nb", 2).line, 2);
    assertEquals(location("a\rb", 2).line, 2);
    assertEquals(location("a\r\nb", 2).line, 2);
  });

  it("finds the last line", () => {
    assertEquals(location("a\nb", -1).line, 2);
    assertEquals(location("a\rb", -1).line, 2);
    assertEquals(location("a\r\nb", -1).line, 2);
  });
});

describe("examples", () => {
  assertEquals(location("a\n\nb", 3), { offset: 3, line: 3, column: 1 });
});

describe("location.offset", () => {
  it('handles ""', () => {
    assertEquals(location("", 0).offset, 0);
    assertEquals(location("", -1).offset, 0);
  });

  it("starts at offset 0", () => assertEquals(location("a", 0).offset, 0));

  it("can locate end of text", () => assertEquals(location("a", 1).offset, 1));

  it("finds an offset within a line", () => {
    assertEquals(location("a\nb", 2).offset, 2);
    assertEquals(location("a\rb", 2).offset, 2);
    assertEquals(location("a\r\nb", 2).offset, 2);
  });

  it("finds the last offset", () => {
    assertEquals(location("a\nb", -1).offset, 3);
    assertEquals(location("a\rb", -1).offset, 3);
    assertEquals(location("a\r\nb", -1).offset, 4);
  });
});
