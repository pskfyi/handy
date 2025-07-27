export type Primitive = string | number | boolean | null;
export type Object = { [K in string]?: Value };
export type Array = Value[];
export type Value = Primitive | Object | Array;

export type TypeName =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array";
