import { InvalidPointerError, InvalidTokenError } from "./errors.ts";
import { isEscaped, UNESCAPED_TILDE_PATTERN } from "./escape.ts";
import type { Pointer, Token } from "./types.ts";

export function isToken(input: string): input is Token {
  return isEscaped(input);
}

export function isPointer(input: string): input is Pointer {
  return input === "" ||
    (input.startsWith("/") && input.match(UNESCAPED_TILDE_PATTERN) === null);
}

export function assertToken(input: string): asserts input is Token {
  if (!isToken(input)) throw new InvalidTokenError(input);
}

export function assertPointer(input: string): asserts input is Pointer {
  if (!isPointer(input)) throw new InvalidPointerError(input);
}
