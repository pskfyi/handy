import { describe, test } from "@std/testing/bdd";
import { assert, assertEquals, assertThrows } from "@std/assert";
import type * as Json from "./types.ts";
import {
  AddOp,
  CopyOp,
  MoveOp,
  RemoveOp,
  ReplaceOp,
  TestOp,
} from "./_patch/classes.ts";
import * as JsonPatch from "./_patch/mod.ts";

type Events<Op extends JsonPatch.Operation> = Array<[
  op: Op,
  docFactory: () => Json.Value | undefined,
  result?: Json.Value,
  replaced?: Json.Value,
]>;

const ADD_EVENTS: Events<JsonPatch.AddOp> = [
  // overwrites document when path is a root pointer
  [new AddOp("", 777), () => [{}], 777, [{}]],
  // overwrites undefined document when path is a root pointer
  [new AddOp("", true), () => undefined, true],
  // inserts into arrays
  [new AddOp("/0", 5), () => [], [5]],
  [new AddOp("/1", 6), () => [5], [5, 6]],
  [new AddOp("/1", 6), () => [5, 7], [5, 6, 7]],
  // pushes onto arrays
  [new AddOp("/-", 7), () => [5, 6], [5, 6, 7]],
  // creates new object properties
  [new AddOp("/A", 4), () => ({}), { A: 4 }],
  // overwrites existing object properties
  [new AddOp("/A", 2), () => ({ A: 1 }), { A: 2 }, 1],
];

const INVALID_ADD_EVENTS: Events<JsonPatch.AddOp> = [
  // undefined document when path is a child pointer
  [new AddOp("/A", true), () => undefined],
  // pointer's parent must be an object or array
  [new AddOp("/A", 5), () => ("")],
  [new AddOp("/0", 5), () => (7)],
  // pointer's parent must exist already
  [new AddOp("/A/B", 5), () => ({})],
  // inserts into arrays beyond its length
  [new AddOp("/1", 7), () => []],
  // pointer must match parent type
  [new AddOp("/0", 5), () => ({})],
  [new AddOp("/A", 5), () => []],
];

const REMOVE_EVENTS: Events<JsonPatch.RemoveOp> = [
  // removes whole documents
  [new RemoveOp(""), () => 7, undefined, 7],
  [{ op: "remove", path: "" }, () => [{}], undefined, [{}]],
  // removes children
  [new RemoveOp("/0"), () => [true], [], true],
  [new RemoveOp("/1/0"), () => [7, [true]], [7, []], true],
  [new RemoveOp("/A"), () => ({ A: 7 }), {}, 7],
];

const INVALID_REMOVE_EVENTS: Events<JsonPatch.RemoveOp> = [
  [new RemoveOp("/0"), () => []],
  [new RemoveOp("/A"), () => ({})],
];

const REPLACE_EVENTS: Events<JsonPatch.ReplaceOp> = [
  // overwrites document when path is a root pointer
  [new ReplaceOp("", 777), () => [{}], 777, [{}]],
  // overwrites undefined document when path is a root pointer
  [new ReplaceOp("", true), () => undefined, true],
  // overwrites existing array items
  [new ReplaceOp("/0", 6), () => [5], [6], 5],
  // overwrites existing object properties
  [new ReplaceOp("/A", 2), () => ({ A: 1 }), { A: 2 }, 1],
];

const INVALID_REPLACE_EVENTS: Events<JsonPatch.ReplaceOp> = [
  // undefined document when path is a child pointer
  [new ReplaceOp("/A", true), () => undefined],
  // pointer's parent must be an object or array
  [new ReplaceOp("/A", 5), () => ("")],
  [new ReplaceOp("/0", 5), () => (7)],
  // pointer's parent must exist already
  [new ReplaceOp("/A/B", 5), () => ({})],
];

const MOVE_EVENTS: Events<JsonPatch.MoveOp> = [
  // can move a document onto itself; primitives allowed
  [new MoveOp("", ""), () => 7, 7],
  // moves values in arrays or objects
  [new MoveOp("/1", "/0"), () => [2, 1], [1, 2]],
  [new MoveOp("/1", "/0"), () => [2, 1, 3], [1, 2, 3]],
  [new MoveOp("/B", "/A"), () => ({ A: 7 }), { B: 7 }],
  // overwrites values in objects
  [new MoveOp("/B", "/A"), () => ({ A: 7, B: 8 }), { B: 7 }, 8],
];

const INVALID_MOVE_EVENTS: Events<JsonPatch.MoveOp> = [
  // cannot move to a location that doesn't exist after removal
  [new MoveOp("/0", ""), () => []],
  [new MoveOp("/A", ""), () => ({})],
];

const COPY_EVENTS: Events<JsonPatch.CopyOp> = [
  // can copy a document on top of itself; primitives allowed
  [new CopyOp("", ""), () => 7, 7, 7],
  // inserts values into objects and arrays
  [new CopyOp("/1", "/0"), () => [1], [1, 1]],
  [new CopyOp("/1", "/0"), () => [1, 2], [1, 1, 2]],
  [new CopyOp("/B", "/A"), () => ({ A: 7 }), { A: 7, B: 7 }],
  // overwrites values in objects
  [new CopyOp("/B", "/A"), () => ({ A: 7, B: 8 }), { A: 7, B: 7 }, 8],
  // can copy a document to a location within itself
  [new CopyOp("/0", ""), () => [], [[]]],
  [new CopyOp("/A", ""), () => ({}), { A: {} }],
];

const INVALID_COPY_EVENTS: Events<JsonPatch.CopyOp> = [
  // cannot copy to a location that whose parent doesn't exist
  [new CopyOp("/0/0", ""), () => []],
  [new CopyOp("/A/B", ""), () => ({})],
];

const TEST_EVENTS: Array<[JsonPatch.TestOp, Json.Value]> = [
  [new TestOp("", 7), 7],
  [new TestOp("", "A"), "A"],
  [new TestOp("", true), true],
  [new TestOp("", null), null],
  [new TestOp("", []), []],
  [new TestOp("", [5, "B", null, true]), [5, "B", null, true]],
  [new TestOp("/0", 5), [5, "B", null, true]],
  [new TestOp("/1", "B"), [5, "B", null, true]],
  [new TestOp("/2", null), [5, "B", null, true]],
  [new TestOp("/3", true), [5, "B", null, true]],
  [new TestOp("", {}), {}],
  [new TestOp("", { A: [7, null, true] }), { A: [7, null, true] }],
  [new TestOp("/A", [7, null, true]), { A: [7, null, true] }],
  [new TestOp("/A/0", 7), { A: [7, null, true] }],
  [new TestOp("/A/1", null), { A: [7, null, true] }],
  [new TestOp("/A/2", true), { A: [7, null, true] }],
];

const INVALID_TEST_EVENTS: Array<[JsonPatch.TestOp, Json.Value]> = [
  [new TestOp("", 6), 7],
  [new TestOp("", ""), "A"],
  [new TestOp("", true), false],
  [new TestOp("", null), 0],
  [new TestOp("", []), {}],
  [new TestOp("", [5, "B", null, true]), [5, "B", null, false]],
  [new TestOp("", {}), []],
  [new TestOp("", { A: [7, null, true] }), { A: [6, null, true] }],
];

function assertValidEvents<Op extends JsonPatch.Operation>(
  validEvents: Events<Op>,
) {
  validEvents.forEach(([op, createDoc, result]) => {
    const doc = createDoc();
    const _result = JsonPatch.applyOperation(doc, op);
    assertEquals(_result, result);
    assert(op.path === "" || _result === doc); // confirm input was mutated
  });
}

function assertInvalidEvents<Op extends JsonPatch.Operation>(
  invalidEvents: Events<Op>,
) {
  invalidEvents.forEach(([op, createDoc]) => {
    const doc = createDoc();
    assertThrows(() => JsonPatch.applyOperation(doc, op));
  });
}

describe("JsonPatch", () => {
  test("classes", () => {
    const _ops: JsonPatch.Operation[] = [
      new JsonPatch.AddOp("", true),
      new JsonPatch.RemoveOp(""),
      new JsonPatch.ReplaceOp("", true),
      new JsonPatch.MoveOp("", ""),
      new JsonPatch.CopyOp("", "/"),
      new JsonPatch.TestOp("", true),
    ];
  });

  test(".add()", () => {
    ADD_EVENTS.forEach(([op, createDoc, result, replaced]) => {
      const doc = createDoc();
      const [_result, _replaced] = JsonPatch.add(doc, op.path, op.value);
      assertEquals(_result, result);
      assertEquals(_replaced, replaced); // confirm replaced values, if any
      assert(op.path === "" || _result === doc); // confirm input was mutated
    });

    INVALID_ADD_EVENTS.forEach(([op, createDoc]) => {
      const doc = createDoc();
      assertThrows(() => JsonPatch.add(doc, op.path, op.value));
    });
  });

  test(".remove()", () => {
    REMOVE_EVENTS.forEach(([op, createDoc, result, replaced]) => {
      const doc = createDoc()!;
      const [_result, _replaced] = JsonPatch.remove(doc, op.path);
      assertEquals(_result, result);
      assertEquals(_replaced, replaced); // confirm replaced values, if any
      assert(op.path === "" || _result === doc); // confirm input was mutated
    });

    INVALID_REMOVE_EVENTS.forEach(([op, createDoc]) => {
      const doc = createDoc()!;
      assertThrows(() => JsonPatch.remove(doc, op.path));
    });
  });

  test(".replace()", () => {
    REPLACE_EVENTS.forEach(([op, createDoc, result, replaced]) => {
      const doc = createDoc();
      const [_result, _replaced] = JsonPatch.replace(doc, op.path, op.value);
      assertEquals(_result, result);
      assertEquals(_replaced, replaced); // confirm replaced values, if any
      assert(op.path === "" || _result === doc); // confirm input was mutated
    });

    INVALID_REPLACE_EVENTS.forEach(([op, createDoc]) => {
      const doc = createDoc();
      assertThrows(() => JsonPatch.replace(doc, op.path, op.value));
    });
  });

  test(".move()", () => {
    MOVE_EVENTS.forEach(([op, createDoc, result, replaced]) => {
      const doc = createDoc()!;
      const [_result, _replaced] = JsonPatch.move(doc, op.path, op.from);
      assertEquals(_result, result);
      assertEquals(_replaced, replaced); // confirm replaced values, if any
      assert(op.path === "" || _result === doc); // confirm input was mutated
    });

    INVALID_MOVE_EVENTS.forEach(([op, createDoc]) => {
      const doc = createDoc()!;
      assertThrows(() => JsonPatch.move(doc, op.path, op.from));
    });
  });

  test(".copy()", () => {
    COPY_EVENTS.forEach(([op, createDoc, result, replaced]) => {
      const doc = createDoc()!;
      const [_result, _replaced] = JsonPatch.copy(doc, op.path, op.from);
      assertEquals(_result, result);
      assertEquals(_replaced, replaced); // confirm replaced values, if any
      assert(op.path === "" || _result === doc); // confirm input was mutated
    });

    INVALID_COPY_EVENTS.forEach(([op, createDoc]) => {
      const doc = createDoc()!;
      assertThrows(() => JsonPatch.copy(doc, op.path, op.from));
    });
  });

  test(".test()", () => {
    TEST_EVENTS.forEach(([op, doc]) => {
      JsonPatch.test(doc, op.path, op.value);
    });

    INVALID_TEST_EVENTS.forEach(([op, doc]) => {
      assertThrows(() => JsonPatch.test(doc, op.path, op.value));
    });
  });

  test(".applyOperation()", () => {
    assertValidEvents(ADD_EVENTS);
    assertInvalidEvents(INVALID_ADD_EVENTS);

    assertValidEvents(REMOVE_EVENTS);
    assertInvalidEvents(INVALID_REMOVE_EVENTS);

    assertValidEvents(REPLACE_EVENTS);
    assertInvalidEvents(INVALID_REPLACE_EVENTS);

    assertValidEvents(MOVE_EVENTS);
    assertInvalidEvents(INVALID_MOVE_EVENTS);

    assertValidEvents(COPY_EVENTS);
    assertInvalidEvents(INVALID_COPY_EVENTS);

    TEST_EVENTS.forEach(([op, doc]) => {
      JsonPatch.applyOperation(doc, op);
    });

    INVALID_TEST_EVENTS.forEach(([op, doc]) => {
      assertThrows(() => JsonPatch.applyOperation(doc, op));
    });

    // throws on undefined documents w/ non-add, non-replace ops
    [
      new MoveOp("", ""),
      new CopyOp("", ""),
      new RemoveOp(""),
      new TestOp("", null),
    ]
      .forEach((op) =>
        assertThrows(() => JsonPatch.applyOperation(undefined, op))
      );
  });

  describe(".apply()", () => {
    test("applies a sequence of operations immutably", () => {
      const document: Json.Object = { A: true };
      const patch: JsonPatch.Type = [
        new AddOp("/B", null),
        new CopyOp("/C", "/A"),
        new ReplaceOp("/A", 7),
        new MoveOp("/D", "/A"),
        new TestOp("/B", null),
        new RemoveOp("/B"),
      ];
      const result = JsonPatch.apply(document, patch);
      assertEquals(document, { A: true });
      assertEquals(result, { C: true, D: 7 });
    });

    test("terminates when an invalid operation is encountered", () => {
      const patch: JsonPatch.Type = [
        new TestOp("", {}),
        new RemoveOp(""),
        new TestOp("", {}),
      ];
      assertThrows(() => JsonPatch.apply({}, patch));
    });

    test("can remove a whole document", () => {
      const document = { foo: true };
      const patch: JsonPatch.Type = [new RemoveOp("")];
      const result = JsonPatch.apply(document, patch);
      assert(result === undefined);
      assertEquals(document, { foo: true });
    });

    test("can remove then create a whole document", () => {
      const document = { foo: true };
      const patch: JsonPatch.Type = [
        new RemoveOp(""),
        new AddOp("", 999),
      ];
      const result = JsonPatch.apply(document, patch);
      assertEquals(result, 999);
      assertEquals(document, { foo: true });
    });

    test("can overwrite a whole document", () => {
      const document = { foo: true };
      const patch: JsonPatch.Type = [new ReplaceOp("", 777)];
      const result = JsonPatch.apply(document, patch);
      assertEquals(result, 777);
      assertEquals(document, { foo: true });
    });

    test("doesn't mutated the patch", () => {
      const patch: JsonPatch.Type = [
        new AddOp("/A", {}),
        new AddOp("/A/B", 7),
      ];
      const result = JsonPatch.apply({}, patch);
      assertEquals(patch[0], new AddOp("/A", {}));
      assertEquals(result, { A: { B: 7 } });
    });
  });
});
