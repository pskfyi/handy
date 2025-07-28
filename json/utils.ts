import type * as Json from "./types.ts";

/**
 * @module
 *
 * JSON utilities. */

/** Alias for `JSON.parse` with no options. */
export function parse(string: string): Json.Value {
  return JSON.parse(string);
}

/** Alias for `JSON.stringify(value, null, 2)`. */
export function prettyPrint(value: Json.Value): string {
  return JSON.stringify(value, null, 2);
}

/** Alias for `JSON.stringify` with no options. */
export function minify(value: Json.Value): string {
  return JSON.stringify(value);
}

/** Alias for `JSON.parse(JSON.stringify(value))`. */
export function clone<T extends Json.Value>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** If the input is a string, number, boolean, null, object, or array, return
 * a human-readable type name. Otherwise returns `undefined`. */
export function shallowTypeOf(input: unknown): Json.TypeName | undefined {
  const type = typeof input;

  if (
    type === "bigint" ||
    type === "function" ||
    type === "symbol" ||
    type === "undefined"
  ) {
    return undefined;
  }

  if (type === "object") {
    if (input === null) {
      return "null";
    } else if (Array.isArray(input)) {
      return "array";
    } else if (input instanceof Map || input instanceof Set) {
      return undefined;
    }
  }

  return type;
}

/** Deep type check. If the input is a string, number, boolean, null, object
 * with JSON-serializable properties, or array with JSON-serializable valid,
 * return a human-readable type name. Otherwise returns `undefined`. */
export function typeOf(input: unknown): Json.TypeName | undefined {
  const type = shallowTypeOf(input);

  if (type === "array") {
    return (input as Json.Array).every((child) => typeOf(child) !== undefined)
      ? "array"
      : undefined;
  } else if (type === "object") {
    return Object.getOwnPropertySymbols(input).length === 0 &&
        Object.values(input as Record<string, unknown>).every((child) =>
          typeOf(child) !== undefined
        )
      ? "object"
      : undefined;
  } else {
    return type;
  }
}

// Type guards
export function isValue(input: unknown): input is Json.Value {
  return typeOf(input) !== undefined;
}

export function isPrimitive(input: unknown): input is Json.Primitive {
  const type = typeof input;
  return type === "string" || type === "boolean" || type === "number" ||
    input === null;
}

export function isArray(input: unknown): input is Json.Array {
  return typeOf(input) === "array";
}

export function isObject(input: unknown): input is Json.Object {
  return typeOf(input) === "object";
}

/** Checks the input's type without checking if its children are
 * JSON-serializable. */
export function isObjectShallow(input: unknown): input is Json.Object {
  return shallowTypeOf(input) === "object";
}

/** Deep equality by value, as defined in the RFC for JSON Patch's 'test'
 * operation: https://datatracker.ietf.org/doc/html/rfc6902#section-4.6 */
export function equals(first: Json.Value, second: Json.Value): boolean {
  const firstType = shallowTypeOf(first);
  const secondType = shallowTypeOf(second);

  if (firstType !== secondType) return false;

  if (firstType === "array") {
    const _first = first as Json.Array;
    const _second = second as Json.Array;

    return (
      _first.every((item, index) => equals(item, _second[index])) &&
      _first.length === _second.length
    );
  }

  if (firstType === "object") {
    const _first = first as Json.Object;
    const _second = second as Json.Object;
    const firstKeys = Object.keys(_first);

    return (
      firstKeys.every(
        (key) =>
          key in _second &&
          equals(_first[key] as Json.Value, _second[key] as Json.Value),
      ) && firstKeys.length === Object.keys(_second).length
    );
  }

  return first === second;
}
