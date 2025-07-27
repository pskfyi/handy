# 👋 Handy

[![JSR](https://jsr.io/badges/@psk/handy)](https://jsr.io/@psk/handy) [![deno module](https://shield.deno.dev/x/handy)](https://deno.land/x/handy)

Utility functions, classes, types, and scripts in uncompiled TS, for Deno.

- [`array`](#array)
- [`cli`](#cli)
- [`collection`](#collection)
- [`deno`](#deno)
  - [`exports/script/update`](#exportsscriptupdate)
- [`fs`](#fs)
- [`git`](#git)
  - [`script/makeReleaseNotes`](#scriptmakereleasenotes)
- [`graph`](#graph)
- [`io`](#io)
- [`js`](#js)
- [`json`](#json)
- [`md`](#md)
  - [`script/evalCodeBlocks`](#scriptevalcodeblocks)
- [`mermaid`](#mermaid)
- [`number`](#number)
- [`object`](#object)
- [`os`](#os)
- [`parser`](#parser)
- [`path`](#path)
- [`string`](#string)
- [`ts`](#ts)

## `array`

Array-related utilities.

```ts
import { mapOnInterval } from "jsr:@psk/handy/array";

mapOnInterval([3, 2, 1, "go!"], 100, (item) => console.log(item));
// logs: 3
// 100ms later, logs: 2
// 100ms later, logs: 1
// 100ms later, logs: "go!"
```

```ts
import type { Tuple, TypedArray } from "jsr:@psk/handy/array";

const arr: TypedArray = new Uint8Array();

type Filled = Tuple.Fill<["a", "b"], 7>; // [7, 7]
type Flattened = Tuple.Flat<[[1, 2], [3, 4]]>; // [1, 2, 3, 4]
type Indices = Tuple.Indices<["a", "b", "c"]>; // [0, 1, 2]
type Index = Tuple.Index<["a", "b", "c"]>; // 0 | 1 | 2
type Reversed = Tuple.Reverse<[1, 2, 3]>; // [3, 2, 1]
type Deed = Tuple.FromIndices<["d", "e"], [0, 1, 1, 0]>; // ["d", "e", "e", "d"]
type ThreeUnknowns = Tuple.OfLength<3>; // [unknown, unknown, unknown]
```

## `cli`

CLI-related utilities.

```ts
import { cmd, cmds, consoleWidth } from "jsr:@psk/handy/cli";

await cmd("deno -V"); // ex: "deno 1.34.0"
await cmds(['echo "Hello"', 'echo "World"']); // executes all and provides a summary of successes and failures
consoleWidth(80); // real width of terminal, or fallback of 80
```

## `collection`

Utilities related to generic collection types, like `Iterable`s.

```ts
import { largest, position, smallest } from "jsr:@psk/handy/collection";

largest(["aaa", "b", "cc"]); // "aaa"
smallest(["aaa", "b", "cc"]); // "b"

largest("size", [new Set([1]), new Set([2, 3]), new Set()]); // new Set([2, 3])
smallest("size", [new Set([1]), new Set([2, 3]), new Set()]); // new Set()

// a Position is a location between items in a collection
position.toPosition(-1, ["a", "b", "c"]); // 2, position between b and c
position.toPosition(-1, "abc"); // 2, position between b and c

// -0 is the end of the collection
position.toPosition(-0, ["a", "b", "c"]); // 3
position.toPosition(-0, "abc"); // 3

position.next(0, "a"); // 1, after a
position.next(1, "a"); // null, no next position exists
position.previous(1); // 0 (no collection needed)
position.previous(0); // null, no previous position exists

position.isPosition(NaN, []); // false
position.assert(0, []); // 0 is always valid
```

```ts
import { Index, IndexedCollection, Indices } from "jsr:@psk/handy/collection";

const arr = ["a", "b", "c"] satisfies IndexedCollection;
const str = "XY" satisfies IndexedCollection;
const typedArr = new Uint8Array() satisfies IndexedCollection;

type ArrIndices = Indices<typeof arr>; // [0, 1, 2]
type StrIndices = Indices<typeof str>; // [0, 1]
type TypedArrIndices = Indices<typeof typedArr>; // number[]

type ArrIndex = Index<typeof arr>; // 0 | 1 | 2
type StrIndex = Index<typeof str>; // 0 | 1
type TypedArrIndex = Index<typeof typedArr>; // number
```

## `deno`

Deno exports utilities.

```ts
import { determine } from "jsr:@psk/handy/deno/exports/determine";

await determine("./_test/fixture/deno", {/* Options */});
// { ".": "./mod.ts", "some/path": "some/path.ts" }
```

### `exports/script/update`

```no-eval
Updates the exports field in a deno.json file to include .ts files in the current directory and its subdirectories, sorted by key. Excludes files and directories that start with a dot or underscore, and test files.

Usage:
  deno run -A jsr:@psk/handy/deno/script/updateExports [path]

Arguments:
  path    A deno.json file or directory containing one. Searches the current directory by default.

Options:
  -h, --help         Show this help message
  -d, --dry-run      Show what would be done without making any changes
  -r, --root=<path>  Make export paths relative to the provided path. Defaults to the deno.json file's directory.

Examples:
  deno run -A jsr:@psk/handy/deno/script/updateExports

  deno run -A jsr:@psk/handy/deno/script/updateExports ./path/to/deno.json

  deno run -A jsr:@psk/handy/deno/script/updateExports -root=src
```

## `fs`

File system-related utilities.

```ts
import { findNearestFile, glob, globImport } from "jsr:@psk/handy/fs";

await findNearestFile(".", "some.file"); // "../../some.file"
await glob("./**/*.ts"); // all TS files in cwd and subdirs

const modules = await globImport("./**/*.ts");

for (const [path, module] of Object.entries(modules)) {
  console.log(path); // something.ts
  const data = await module(); // import something.ts
}
```

## `git`

Git-related utilities.

```ts
import { assertUnmodified, commit, tag } from "jsr:@psk/handy/git";

await tag.getLatest().catch(console.log); // ex. "v1.0.0"

await commit.sha("HEAD").catch(console.log); // ex. "a1b2c3d4e5f6..."
await commit.get("HEAD").catch(console.log); // { message: "...", ... }
commit.conventional.parse("feat(scope)!: description"); // { type: "feat", ... }

await assertUnmodified().catch(console.log); // throws if there are unstaged changes
await assertUnmodified("deno.json").catch(console.log); // can check a specific file
```

### `script/makeReleaseNotes`

For a git repo, scan the commit history for conventional commits since the last tag and generate a markdown-formatted list of features and fixes.

```ts
import { makeReleaseNotes } from "jsr:@psk/handy/git/script/makeReleaseNotes";
```

When run as a script, it will generate release notes for the repo in the current working directory. The directory can be overridden by the first argument, and the `--to-clipboard` flag will copy the release notes to the clipboard instead of printing them to stdout.

```no-eval
Usage:
  deno run -A jsr:@psk/handy/git/script/makeReleaseNotes [options] [path]

Options:
  -h, --help          Show this help message
  -c, --to-clipboard  Copy release notes to clipboard
  -i, --inclusive     Include the first commit
  -v, --verbose       Print verbose output
  -g, --group-by-type Group commits by type using H2 headings
  --commit=<commit>   Commit to use as base for release notes
  --types=<types>     Comma-separated list of types to include
  --<type>=<name>     Name to use for a type's H2 when grouping by type

Examples:
  deno run -A jsr:@psk/handy/git/script/makeReleaseNotes -cgv

  deno run -A jsr:@psk/handy/git/script/makeReleaseNotes --commit v1.0.0

  deno run -A jsr:@psk/handy/git/script/makeReleaseNotes \
    --types=feat,custom --custom="Custom's Section Heading"
```

## `graph`

Graph-related utilities.

```ts
import { DirectedGraph } from "jsr:@psk/handy/graph";

const graph = new DirectedGraph<string>()
  .add("a")
  .add("b", ["a", "c"]);

graph.vertices; // new Set(["a", "b", "c"])
graph.edges; // new Set([["a", "c"]])
```

## `io`

Assorted I/O utilities which don't fit in other categories.

> NOTE: Only supports MacOS and Windows

```ts
import { clipboard } from "jsr:@psk/handy/io";

clipboard.copy("foo").catch(console.log);
clipboard.paste().catch(console.log); // "foo"
```

## `js`

JavaScript utilities.

```ts
import { evaluate } from "jsr:@psk/handy/js";

const { stdout } = await evaluate("console.log('Hello!')");
//         ^? "Hello!"
```

## `json`

Utility types.

```ts
import {
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
} from "jsr:@psk/handy/json";

const a: JsonPrimitive = "some string"; // or number, boolean, null
const b: JsonArray = [1, ["2", true], { a: null }];
const c: JsonObject = { a: 1, b: ["2", true], d: { e: null } };
// JsonValue = any of the above
```

## `md`

Markdown-related utilities.

````ts
import { codeBlock } from "jsr:@psk/handy/md";

codeBlock.create("grep"); // "    grep"
codeBlock.create("const a: number = 1", { lang: "ts" });
codeBlock.parse("```ts\nconst a: number = 1\n```");
codeBlock.findAll("    grep\n```cd```"); // ["    grep", "```cd```"]
codeBlock.evaluate(
  codeBlock.create('console.log("Hello!")', { lang: "ts" }),
);
````

### `script/evalCodeBlocks`

For a markdown file, execute each TS or JS code block in the file. Useful for checking imports and examples in a readme.

```ts
import { evalCodeBlocks } from "jsr:@psk/handy/md/script/evalCodeBlocks";
```

Code blocks can individually opt out of evaluation by placing `no-eval` in the [info string](https://spec.commonmark.org/0.30/#info-string).

````no-eval
```no-eval
Without language code.
```

```ts no-eval
console.log("With language code.");
```
````

When run as a script, it will execute the code blocks in the file specified by the first argument. The second and third arguments are optional, and are used to find and replace a string in the file before executing the code blocks.

```sh no-eval
deno run --allow-read --allow-run \
  jsr:@psk/handy/scripts/evalCodeBlocks \
  ./readme.md \
  "some string to find" "replacement string" # optional
```

## `mermaid`

```ts
import { flowchart } from "jsr:@psk/handy/mermaid";
import { DirectedGraph } from "jsr:@psk/handy/graph";
import { codeBlock } from "jsr:@psk/handy/md";

const graph = new DirectedGraph<string>();

graph.add(["a", "b", "c", "d"], ["h", "i", "j", "k"], ["c", "h"], ["d", "i"]);

flowchart(graph.edges, { title: "Example Flowchart" }); //outputs mermaid flowchart markdown below
```

```mermaid
---
title: Example Flowchart
---
flowchart LR
    a --> b
    b --> c
    c --> d
    c --> h
    d --> i
    h --> i
    i --> j
    j --> k
```

## `number`

Number-related utilities.

```ts
import { Num } from "jsr:@psk/handy/number";

type T = Num.Type<1.1>; // "+float"
type U = Num.Type<0>; // "zero"
type V = Num.Type<-5>; // "-integer"

// type filters return `never` if the type doesn't match
type Finite = Num.Finite<0>; // 0
type NotFinite = Num.Finite<number>; // never

type Wide = Num.Wide<number>; // number
type NotWide = Num.Wide<1>; // never

type Int = Num.Integer<1>; // 1
type NotInt = Num.Integer<1.1>; // never

type Float = Num.Float<1.1>; // 1.1
type NotFloat = Num.Float<1>; // never
```

## `object`

Object-related utilities.

```ts
import { setNestedEntry } from "jsr:@psk/handy/object";

const S = Symbol("symbol");
setNestedEntry({}, ["a", 10, S], "👋"); // { a: { 10: { [S]: "👋" } } }
```

```ts
import type { Obj } from "jsr:@psk/handy/object";

type Key = Obj.Key; // string | number | symbol
type Empty = Obj.Entry; // Record<Key, never>
type Entry = Obj.Entry<any>; // [Key, any]
type Pair = Obj.Pair<"a", number>; // { "a": number }
type EntryToPair = Obj.EntryToPair<Entry>; // Pair
type MyObj = Obj.FromEntries<[["a", 1], ["b", null]]>; // { a: 1, b: null }
type Entries = Obj.ToEntries<MyObj>; // Array<["a", 1], ["b", null]>
```

## `os`

OS-related utilities.

```ts
import { posixNewlines } from "jsr:@psk/handy/os";

posixNewlines("A\r\nB\rC"); // "A\nB\nC"
```

## `parser`

A parser combinator library.

```ts
import { sequence, string } from "jsr:@psk/handy/parser";

const dash = string("-").ignore;
const phoneNumber = sequence(/\d{3}/, dash, /\d{3}/, dash, /\d{4}/);

const [result] = phoneNumber.parse("123-456-7890");
//       ^? ["123", "456", "7890"]
```

## `path`

Path-related utilities.

```ts
import { dir, globRoot } from "jsr:@psk/handy/path";

dir(import.meta); // Node.js __dirname
dir("/path/to/file"); // "/path/to"
dir("C:\\\\a\\b\\c"); // "C:\\a\\b"

globRoot("a/b/**/*.ts"); // "a/b/"
```

## `string`

String-related utilities.

```ts
import {
  dedent,
  elideStart, // and others
  escapeTerse,
  indent,
  mostConsecutive,
  replaceMany,
  sequences,
  splitOn,
  splitOnFirst,
  Text,
  TextCursor,
} from "jsr:@psk/handy/string";

dedent("  a\n   b\n    c"); // "a\n b\n  c"
indent("a\nb\nc", 2); // "  a\n  b\n  c"
elideStart("1234567890", { maxLength: 8 }); // "…4567890"
escapeTerse("\t\t\n"); // "⇥⇥¶"
replaceMany("aabbcc", { a: "X", b: "Y" }); // "XXYYcc"
splitOnFirst("/", "a/b/c"); // ["a", "b/c"]
splitOn(3, "\n", "a\nb\nc\nd\ne"); // ["a", "b", "c", "d\ne"]
sequences("A", "ABAACA"); // ["A", "AA", "A"]
mostConsecutive("A", "ABAACA"); // 2

const text = new Text("a\nb\nc");
text.lines; // ["a\n", "b\n", "c"]
text.locationAt(4); // location of "c", { line: 3, column: 1, offset: 4 }
text.locationAt(5); // end of text, { line: 3, column: 2, offset: 5 }

const cursor = new TextCursor("a\nb\nc", 2);
cursor.remainder; // "b\nc"
cursor.location; // { offset: 2, line: 2, column: 1 }
cursor.inspect(); // string depicting...
// [L2] b¶
//       ^
```

```ts
import { Str } from "jsr:@psk/handy/string/types";

type Char = Str.Char<"ABC">; // "A" | "B" | "C"
type Index = Str.Index<"ABC">; // 0 | 1 | 2
type Indices = Str.Indices<"ABC">; // [0, 1, 2]
type Tuple = Str.ToTuple<"ABC">; // ["A", "B", "C"]
```

## `ts`

TypeScript-related utilities.

```ts
import { evaluate } from "jsr:@psk/handy/ts";

await evaluate("console.log('Hello!')")
  .then((res) => res.stdout); // "Hello!"
```

```ts
import type { Pretty, Satisfies } from "jsr:@psk/handy/ts";

type Input = { a: number } & { b: string };
//     ^? { a: number } & { b: string }

type Prettified = Pretty<Input>;
//     ^? { a: number; b: string }

type Str<T> = T extends string ? T : never;
type T = Satisfies<Str<"ABC">>; // true
type F = Satisfies<Str<123>>; // false
```
