import { PrettyError } from "../errors.ts";

export class InvalidTokenError extends PrettyError {
  constructor(input: string) {
    super("Not a valid JSON Pointer token:", { input });
  }
}

export class InvalidPointerError extends PrettyError {
  constructor(input: string) {
    super("Not a valid JSON Pointer:", { input });
  }
}
