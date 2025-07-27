import {
  AddOp,
  CopyOp,
  MoveOp,
  RemoveOp,
  ReplaceOp,
  TestOp,
} from "./classes.ts";

export type OperationName =
  | "add"
  | "replace"
  | "test"
  | "remove"
  | "move"
  | "copy";

export type Operation =
  | AddOp
  | ReplaceOp
  | TestOp
  | RemoveOp
  | MoveOp
  | CopyOp;

export type Patch = Operation[];
export type Type = Patch;

export { AddOp, CopyOp, MoveOp, RemoveOp, ReplaceOp, TestOp };
