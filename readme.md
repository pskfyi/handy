# 👋 Handy

[![deno module](https://shield.deno.dev/x/handy)](https://deno.land/x/handy)

Utility functions, classes, and types in uncompiled TS, for Deno.

## `collection`

Utilities related to generic collection types, like `Iterable`s.

```ts
import {
  largest,
  smallest,
} from "https://deno.land/x/handy/collection/utils.ts";
```

## `fs`

File system-related utilities.

```ts
import {
  findNearestFile,
  glob,
  globImport,
} from "https://deno.land/x/handy/fs/utils.ts";
```

## `graph`

Graph-related utilities.

```ts
import { DirectedGraph } from "https://deno.land/x/handy/graph/utils.ts";
```

## `object`

Object-related utilities.

```ts
import { setNestedEntry } from "https://deno.land/x/handy/object/utils.ts";
```

## `path`

Path-related utilities.

```ts
import { globRoot } from "https://deno.land/x/handy/path/utils.ts";
```

## `timing`

Timing-related utilities.

```ts
import { oncePerInterval } from "https://deno.land/x/handy/timing/utils.ts";
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

const c: JsonPrimitive = "some string"; // or number, boolean, null
const a: JsonArray = [1, ["2", true], { a: null }];
const b: JsonObject = { a: 1, b: ["2", true], d: { e: null } };
const d: JsonValue = // any of the above
```
