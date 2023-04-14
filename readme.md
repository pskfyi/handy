# 👋 Handy

[![deno module](https://shield.deno.dev/x/handy)](https://deno.land/x/handy)

Utility functions, classes, and types in uncompiled TS, for Deno.

# <<<<<<< HEAD

## `array`

Array-related utilities.

```ts
import { mapOnInterval } from "https://deno.land/x/handy/array/utils.ts";

mapOnInterval([3, 2, 1, "go!"], 1000, (item) => console.log(item));
// logs: 3
// 1sec later, logs: 2
// 1sec later, logs: 1
// 1sec later, logs: "go!"
```

> 4c407b7 (.)

## `collection`

Utilities related to generic collection types, like `Iterable`s.

```ts
import {
  largest,
  smallest,
} from "https://deno.land/x/handy/collection/utils.ts";

largest(["aaa", "b", "cc"]); // "aaa"
smallest(["aaa", "b", "cc"]); // "b"

largest("size", [new Set([1]), new Set([2, 3]), new Set()]); // new Set([2, 3])
smallest("size", [new Set([1]), new Set([2, 3]), new Set()]); // new Set()
```

## `fs`

File system-related utilities.

```ts
import {
  findNearestFile,
  glob,
  globImport,
} from "https://deno.land/x/handy/fs/utils.ts";

await findNearestFile(".", "some.file"); // "../../some.file"
await glob("./**/*.ts"); // all TS files in cwd and subdirs

const modules = await globImport("./**/*.ts");

for (const [path, module] of Object.entries(modules)) {
  console.log(path); // something.ts
  const data = await module(); // import something.ts
}
```

## `graph`

Graph-related utilities.

```ts
import { DirectedGraph } from "https://deno.land/x/handy/graph/utils.ts";

const graph = new DirectedGraph()
  .add("a")
  .add("b", ["a", "c"])
  .edges; // [["b", "a"], ["b", "c"]]

graph.vertices; // ["a", "b", "c"]
```

## `object`

Object-related utilities.

```ts
import { setNestedEntry } from "https://deno.land/x/handy/object/utils.ts";

const S = Symbol("symbol");
setNestedEntry({}, ["a", 10, S], "👋"); // { a: { 10: { [S]: "👋" } } }
```

## `path`

Path-related utilities.

```ts
import { globRoot } from "https://deno.land/x/handy/path/utils.ts";

globRoot("a/b/*.ts"); // "a/b/"
```

## `timing`

Timing-related utilities.

```ts
import { oncePerInterval } from "https://deno.land/x/handy/timing/utils.ts";

oncePerInterval(1000, [3, 2, 1, "go!"], (el) => console.log(e));
// logs: 3
// 1sec later, logs: 2
// 1sec later, logs: 1
// 1sec later, logs: "go!"
```

## `types`

Utility types.

```ts
import {
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
} from "https://deno.land/x/handy/types/json.ts";

const a: JsonPrimitive = "some string"; // or number, boolean, null
const b: JsonArray = [1, ["2", true], { a: null }];
const c: JsonObject = { a: 1, b: ["2", true], d: { e: null } };
// JsonValue = any of the above
```
