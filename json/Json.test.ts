import { describe, test } from "@std/testing/bdd";
import { assert } from "@std/assert";
import { Json } from "./Json.ts";

const ARRAYS: Json.Array[] = [[], [[]], [[[], []], []]];
const OBJECTS: Json.Object[] = [{}, { A: 1 }];
const COLLECTIONS = [ARRAYS, OBJECTS].flat();

const STRINGS = ["", '"Hello"', `'"`];
const NUMBERS = [123, 0, 1e4];
const BOOLEANS = [true, false];
const PRIMITIVES = [BOOLEANS, null, NUMBERS, STRINGS].flat();

const VALUES = [PRIMITIVES, COLLECTIONS].flat();

const SHALLOW_NON_VALUES = [
  new Map(),
  new Set(),
  () => {},
  class Foo {},
  Symbol.asyncIterator,
  undefined,
  100n,
];
const DEEP_NON_VALUES = [
  [[100n]],
  { [Symbol.asyncIterator]: "" },
];
const NON_VALUES = [SHALLOW_NON_VALUES, DEEP_NON_VALUES].flat();

const TYPE_MAP: Record<Json.TypeName, Json.Value[]> = {
  array: ARRAYS,
  boolean: BOOLEANS,
  null: [null],
  number: NUMBERS,
  object: OBJECTS,
  string: STRINGS,
};

describe("Json", () => {
  test(".shallowTypeOf()", () => {
    Object.entries(TYPE_MAP).forEach(([typeName, values]) =>
      values.forEach((val) => assert(Json.typeOf(val) === typeName))
    );

    SHALLOW_NON_VALUES.forEach((val) => assert(Json.typeOf(val) === undefined));
  });

  test(".typeOf()", () => {
    Object.entries(TYPE_MAP).forEach(([typeName, values]) =>
      values.forEach((val) => assert(Json.typeOf(val) === typeName))
    );

    NON_VALUES.forEach((val) => assert(Json.typeOf(val) === undefined));
  });

  test(".isPrimitive()", () => {
    PRIMITIVES.forEach((val) => assert(Json.isPrimitive(val)));
    COLLECTIONS.forEach((val) => assert(!Json.isPrimitive(val)));

    NON_VALUES.forEach((val) => assert(!Json.isPrimitive(val)));
  });

  test(".isArray()", () => {
    ARRAYS.forEach((val) => assert(Json.isArray(val)));

    PRIMITIVES.forEach((val) => assert(!Json.isArray(val)));
    OBJECTS.forEach((val) => assert(!Json.isArray(val)));
    NON_VALUES.forEach((val) => assert(!Json.isArray(val)));
    NON_VALUES.forEach((val) => assert(!Json.isArray([val])));
  });

  test(".isObject()", () => {
    OBJECTS.forEach((val) => assert(Json.isObject(val)));

    PRIMITIVES.forEach((val) => assert(!Json.isObject(val)));
    ARRAYS.forEach((val) => assert(!Json.isObject(val)));
    NON_VALUES.forEach((val) => assert(!Json.isObject(val)));
    NON_VALUES.forEach((val) => assert(!Json.isObject({ "": val })));
  });

  test(".isValue()", () => {
    VALUES.forEach((val) => assert(Json.isValue(val)));

    NON_VALUES.forEach((val) => assert(!Json.isValue(val)));

    assert(!Json.isValue([() => {}]));
    assert(!Json.isValue([[undefined]]));
    assert(!Json.isValue([[[100n]]]));
    assert(!Json.isValue({ "": [{ "": Symbol.asyncIterator }] }));
    assert(!Json.isValue({ "": [{ [Symbol.asyncIterator]: "" }] }));
  });

  test(".equals()", () => {
    VALUES.forEach((val) => assert(Json.equals(val, val)));
    assert(Json.equals(
      { "foo": [0, null, false], "bar": [1, true] },
      { "foo": [0, null, false], "bar": [1, true] },
    ));

    assert(!Json.equals("A", "B"));
    assert(!Json.equals(0, 1));
    assert(!Json.equals(true, false));
    assert(!Json.equals(false, true));
    assert(!Json.equals(null, false));
    assert(!Json.equals([], {}));
    assert(!Json.equals({}, []));
    assert(
      !Json.equals(
        { "foo": [0, null, false], "bar": [1, true] },
        { "bar": [0, null, false], "foo": [1, true] },
      ),
    );
  });
});
