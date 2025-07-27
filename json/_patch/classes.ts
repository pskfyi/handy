import type * as Json from "../types.ts";
import type * as JsonPointer from "../_pointer/types.ts";
import type { Operation } from "./types.ts";

abstract class Op {
  abstract op: Operation["op"];

  constructor(public path: JsonPointer.Pointer) {}
}

abstract class ValueOp extends Op {
  constructor(path: JsonPointer.Pointer, public value: Json.Value) {
    super(path);
  }
}

abstract class TransitiveOp extends Op {
  constructor(path: JsonPointer.Pointer, public from: JsonPointer.Pointer) {
    super(path);
  }
}

export class AddOp extends ValueOp {
  op = "add" as const;
}

export class RemoveOp extends Op {
  op = "remove" as const;
}

export class ReplaceOp extends ValueOp {
  op = "replace" as const;
}

export class MoveOp extends TransitiveOp {
  op = "move" as const;
}

export class CopyOp extends TransitiveOp {
  op = "copy" as const;
}

export class TestOp extends ValueOp {
  op = "test" as const;
}
