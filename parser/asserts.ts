import { assertEquals } from "@std/assert";
import { Result } from "./core.ts";
import { Ignored, IgnoredParser } from "./ignored.ts";

/** Asserts that the parser result matches the expected value and remainder. */
export function assertParseResult<T>(
  [value, cursor]: Result<T>,
  expectedValue: T,
  expectedRemainder = "",
): void {
  assertEquals(value, expectedValue, "value");
  assertEquals(cursor.remainder, expectedRemainder, "remainder");
}

export function assertIgnored(
  [value, cursor]: Result<Ignored>,
  expectedRemainder = "",
): void {
  assertEquals(value, IgnoredParser.SYMBOL, "value is not ignored");
  assertEquals(cursor.remainder, expectedRemainder, "remainder");
}
