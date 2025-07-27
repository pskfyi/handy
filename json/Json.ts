import * as JsonUtils from "./utils.ts";
import type * as JsonType from "./types.ts";
import type { Pretty } from "../ts/types.ts";

/** Convenience wrapper around baseline JSON utils and types. */
const Json: Pretty<typeof JsonUtils> = JsonUtils;
declare namespace Json {
  export type Object = JsonType.Object;
  export type Array = JsonType.Array;
  export type Primitive = JsonType.Primitive;
  export type Value = JsonType.Value;
  export type TypeName = JsonType.TypeName;
}

export { Json };
