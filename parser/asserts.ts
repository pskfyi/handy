import { assertEquals } from "../_deps/testing.ts";
import type { Parser } from "./combinator.ts";

/** Asserts that the parser result matches the expected value and remainder. */
export function assertParseResult<T>(
  [value, cursor]: Parser.Result<T>,
  expectedValue: T,
  expectedRemainder = "",
): void {
  assertEquals(value, expectedValue);
  assertEquals(cursor.remainder, expectedRemainder);
}
