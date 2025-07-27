import { assert, assertEquals, assertThrows } from "@std/assert";
import type * as JsonTree from "./tree/types.ts";
import { JsonPointer } from "./JsonPointer.ts";
import { describe, test } from "@std/testing/bdd";

// Test cases inferred from https://datatracker.ietf.org/doc/html/rfc6901

const ESCAPE_EXAMPLES: Array<[string, JsonPointer.Token]> = [
  ["", ""],
  ["foo", "foo"],
  ["~", "~0"],
  ["/", "~1"],
  ["~/", "~0~1"],
  ["/~", "~1~0"],
];
const VALID_TOKENS = ESCAPE_EXAMPLES.map(([_, token]) => token);
const INVALID_TOKENS = ESCAPE_EXAMPLES.slice(2).map(([str]) => str);

const POINTER_EXAMPLES: Array<[JsonPointer.Pointer, JsonTree.Path]> = [
  ["", []],
  ["/", [""]],
  ["/ ", [" "]],
  ["//", ["", ""]],
  ["/foo", ["foo"]],
  ["/7", [7]],
  ["/07", ["07"]],
  ["/~0", ["~"]],
  ["/~1", ["/"]],
  ["/~01", ["~1"]],
  ["/foo/bar", ["foo", "bar"]],
  ["/foo/7", ["foo", 7]],
  ["/foo/07", ["foo", "07"]],
  ["/6/bar", [6, "bar"]],
  ["/6/7", [6, 7]],
  ["/A/B/C", ["A", "B", "C"]],
  ["/foo/7/bar", ["foo", 7, "bar"]],
  ["/fo~1oo/ba~0rr", ["fo/oo", "ba~rr"]],
];

const VALID_POINTERS = POINTER_EXAMPLES.map(([pointer]) => pointer);
const INVALID_POINTERS: string[] = ["foo", "7", "~0", "~1", "/~", "/~2", "/~5"];

const TOKEN_EXAMPLES: Array<[JsonPointer.Token, JsonTree.Edge]> = [
  ["0", 0],
  ["7", 7],
  ["07", "07"],
  ["77", 77],
];

describe("JsonPointer", () => {
  test(".isToken()", () => {
    VALID_TOKENS.forEach((token) => assert(JsonPointer.isToken(token)));
    INVALID_TOKENS.forEach((str) => assert(!JsonPointer.isToken(str)));
  });

  test(".assertToken()", () => {
    VALID_TOKENS.forEach((token) => JsonPointer.assertToken(token));
    INVALID_TOKENS.forEach((str) =>
      assertThrows(() => JsonPointer.assertToken(str))
    );
  });

  test(".isPointer()", () => {
    VALID_POINTERS.forEach((ptr) => assert(JsonPointer.isPointer(ptr)));
    INVALID_POINTERS.forEach((str) => assert(!JsonPointer.isPointer(str)));
  });

  test(".assertPointer()", () => {
    VALID_POINTERS.forEach((ptr) => JsonPointer.assertPointer(ptr));
    INVALID_POINTERS.forEach((str) =>
      assertThrows(() => JsonPointer.assertPointer(str))
    );
  });

  test(".escape()", () => {
    ESCAPE_EXAMPLES.forEach(([str, token]) =>
      assertEquals(JsonPointer.escape(str), token)
    );
  });

  test(".isEscaped()", () => {
    VALID_TOKENS.forEach((token) => assert(JsonPointer.isEscaped(token)));
  });

  test(".unescape()", () => {
    ESCAPE_EXAMPLES.forEach(([str, token]) =>
      assertEquals(JsonPointer.unescape(token), str)
    );
  });

  test(".isUnescaped()", () => {
    INVALID_TOKENS.forEach((str) => assert(JsonPointer.isUnescaped(str)));
  });

  test(".encodeToken()", () => {
    TOKEN_EXAMPLES.forEach(([token, edge]) =>
      assertEquals(JsonPointer.encodeToken(edge), token)
    );
    ESCAPE_EXAMPLES.forEach(([str, token]) =>
      assertEquals(JsonPointer.encodeToken(str), token)
    );
  });

  test(".decodeToken()", () => {
    TOKEN_EXAMPLES.forEach(([token, edge]) =>
      assertEquals(JsonPointer.decodeToken(token), edge)
    );
    ESCAPE_EXAMPLES.forEach(([str, token]) =>
      assertEquals(JsonPointer.decodeToken(token), str)
    );
  });

  test(".encode()", () => {
    POINTER_EXAMPLES.forEach(([pointer, path]) =>
      assertEquals(JsonPointer.encode(path), pointer)
    );
  });

  test(".decode()", () => {
    POINTER_EXAMPLES.forEach(([pointer, path]) =>
      assertEquals(JsonPointer.decode(pointer), path)
    );
    INVALID_POINTERS.forEach((str) =>
      assertThrows(() => JsonPointer.decode(str))
    );
  });

  test(".parsePointer()", () => {
    POINTER_EXAMPLES.forEach(([pointer, path]) =>
      assertEquals(JsonPointer.parsePointer(pointer), path)
    );
  });

  test(".parent()", () => {
    assertEquals(JsonPointer.parent(""), undefined);
    assertEquals(JsonPointer.parent("/"), "");
    assertEquals(JsonPointer.parent("//"), "/");
    assertEquals(JsonPointer.parent("/foo"), "");
    assertEquals(JsonPointer.parent("/foo/bar"), "/foo");
    assertEquals(JsonPointer.parent("/foo/bar/baz"), "/foo/bar");
  });
});
