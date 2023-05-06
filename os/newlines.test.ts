import { assertEquals, describe, it } from "../_deps/testing.ts";
import { macNewlines, posixNewlines, windowsNewlines } from "./newlines.ts";

describe("macNewlines", () => {
  it("replaces \\n", () => assertEquals(macNewlines("foo\nbar"), "foo\rbar"));

  it("replaces \\r\\n", () =>
    assertEquals(macNewlines("foo\r\nbar"), "foo\rbar"));

  it("ignores existing \\r", () =>
    assertEquals(macNewlines("foo\rbar"), "foo\rbar"));
});

describe("posixNewlines", () => {
  it("replaces \\r", () => assertEquals(posixNewlines("foo\rbar"), "foo\nbar"));

  it("replaces \\r\\n", () =>
    assertEquals(posixNewlines("foo\r\nbar"), "foo\nbar"));

  it("ignores existing \\n", () =>
    assertEquals(posixNewlines("foo\nbar"), "foo\nbar"));
});

describe("windowsNewlines", () => {
  it("replaces \\r", () =>
    assertEquals(windowsNewlines("foo\rbar"), "foo\r\nbar"));

  it("replaces \\n", () =>
    assertEquals(windowsNewlines("foo\nbar"), "foo\r\nbar"));

  it("ignores existing \\r\\n", () =>
    assertEquals(windowsNewlines("foo\r\nbar"), "foo\r\nbar"));
});
