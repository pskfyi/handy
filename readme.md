# 👋 Handy

[![deno module](https://shield.deno.dev/x/handy)](https://deno.land/x/handy)

Utility functions, classes, types, and scripts in uncompiled TS, for Deno.

- [Library](#library)
  - [`array`](#array)
  - [`collection`](#collection)
  - [`fs`](#fs)
  - [`graph`](#graph)
  - [`object`](#object)
  - [`path`](#path)
  - [`types`](#types)
- [Scripts](#scripts)
  - [Test Code Blocks](#test-code-blocks)

## Library

### `array`

Array-related utilities.

```ts
import { mapOnInterval } from "https://deno.land/x/handy/array/utils.ts";

mapOnInterval([3, 2, 1, "go!"], 1000, (item) => console.log(item));
// logs: 3
// 1sec later, logs: 2
// 1sec later, logs: 1
// 1sec later, logs: "go!"
```

### `collection`

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

### `fs`

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

### `graph`

Graph-related utilities.

```ts
import { DirectedGraph } from "https://deno.land/x/handy/graph/utils.ts";

const graph = new DirectedGraph()
  .add("a")
  .add("b", ["a", "c"]);

graph.vertices; // ["a", "b", "c"]
graph.edges; // [["b", "a"], ["b", "c"]]
```

### `object`

Object-related utilities.

```ts
import { setNestedEntry } from "https://deno.land/x/handy/object/utils.ts";

const S = Symbol("symbol");
setNestedEntry({}, ["a", 10, S], "👋"); // { a: { 10: { [S]: "👋" } } }
```

### `path`

Path-related utilities.

```ts
import { globRoot } from "https://deno.land/x/handy/path/utils.ts";

globRoot("a/b/*.ts"); // "a/b/"
```

### `types`

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

## Scripts

### Test Code Blocks

For a markdown file, execute each TS code block in the file. Useful for checking imports and examples in a readme.

```ts
import { evalCodeBlocks } from "https://deno.land/x/handy/scripts/evalCodeBlocks.ts";
```

When run as a script, it will execute the code blocks in the file specified by the first argument. The second and third arguments are optional, and are used to find and replace a string in the file before executing the code blocks.

```sh
deno run --allow-read --allow-run \
  https://deno.land/x/handy/scripts/evalCodeBlocks.ts \
  ./readme.md \
  "some string to find" "replacement string" # optional
```
