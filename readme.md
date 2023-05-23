# 👋 Handy

[![deno module](https://shield.deno.dev/x/handy)](https://deno.land/x/handy)

Utility functions, classes, types, and scripts in uncompiled TS, for Deno.

- [`array`](#array)
- [`cli`](#cli)
- [`collection`](#collection)
- [`fs`](#fs)
- [`git`](#git)
  - [`script/makeReleaseNotes`](#scriptmakereleasenotes)
- [`graph`](#graph)
- [`io`](#io)
- [`json`](#json)
- [`md`](#md)
  - [`script/evalCodeBlocks`](#scriptevalcodeblocks)
- [`object`](#object)
- [`os`](#os)
- [`path`](#path)
- [`string`](#string)
- [`ts`](#ts)

## `array`

Array-related utilities.

```ts
import { mapOnInterval } from "https://deno.land/x/handy/array/utils.ts";

mapOnInterval([3, 2, 1, "go!"], 100, (item) => console.log(item));
// logs: 3
// 100ms later, logs: 2
// 100ms later, logs: 1
// 100ms later, logs: "go!"
```

## `cli`

CLI-related utilities.

```ts
import { cmd } from "https://deno.land/x/handy/cli/utils.ts";

await cmd("echo Hello!"); // "Hello!"
```

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

## `git`

Git-related utilities.

```ts
import { commit, tag } from "./git/utils.ts";

await tag.getLatest().catch(console.log); // ex. "v1.0.0"
await commit.get("HEAD").catch(console.log); // { message: "...", ... }
commit.conventional.parse("feat(scope)!: description"); // { type: "feat", ... }
```

### `script/makeReleaseNotes`

For a git repo, scan the commit history for conventional commits since the last tag and generate a markdown-formatted list of features and fixes.

```ts
import { makeReleaseNotes } from "https://deno.land/x/handy/git/script/makeReleaseNotes.ts";
```

When run as a script, it will generate release notes for the repo in the current working directory. The directory can be overridden by the first argument, and the `--to-clipboard` flag will copy the release notes to the clipboard instead of printing them to stdout.

```no-eval
Usage:
  deno run -A https://deno.land/x/handy/git/script/makeReleaseNotes.ts [options] [path]

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
  deno run -A https://deno.land/x/make_release_notes/mod.ts -cgv

  deno run -A https://deno.land/x/make_release_notes/mod.ts --commit v1.0.0

  deno run -A https://deno.land/x/make_release_notes/mod.ts \
    --types=feat,custom --custom="Custom's Section Heading"
```

## `graph`

Graph-related utilities.

```ts
import { DirectedGraph } from "https://deno.land/x/handy/graph/utils.ts";

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
import { clipboard } from "https://deno.land/x/handy/io/utils.ts";

clipboard.copy("foo").catch(console.log);
clipboard.paste().catch(console.log); // "foo"
```

## `json`

Utility types.

```ts
import {
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
} from "https://deno.land/x/handy/json/types.ts";

const a: JsonPrimitive = "some string"; // or number, boolean, null
const b: JsonArray = [1, ["2", true], { a: null }];
const c: JsonObject = { a: 1, b: ["2", true], d: { e: null } };
// JsonValue = any of the above
```

## `md`

Markdown-related utilities.

````ts
import { codeBlock } from "https://deno.land/x/handy/md/utils.ts";

codeBlock.create("grep"); // "    grep"
codeBlock.create("const a: number = 1", { lang: "ts" });
codeBlock.parse("```ts\nconst a: number = 1\n```");
codeBlock.findAll("    grep\n```cd```"); // ["    grep", "```cd```"]
codeBlock.evaluate(
  codeBlock.create('console.log("Hello!")', { lang: "ts" }),
);
````

### `script/evalCodeBlocks`

For a markdown file, execute each TS code block in the file. Useful for checking imports and examples in a readme.

```ts
import { evalCodeBlocks } from "https://deno.land/x/handy/md/script/evalCodeBlocks.ts";
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
  https://deno.land/x/handy/scripts/evalCodeBlocks.ts \
  ./readme.md \
  "some string to find" "replacement string" # optional
```

## `object`

Object-related utilities.

```ts
import { setNestedEntry } from "https://deno.land/x/handy/object/utils.ts";

const S = Symbol("symbol");
setNestedEntry({}, ["a", 10, S], "👋"); // { a: { 10: { [S]: "👋" } } }
```

## `os`

OS-related utilities.

```ts
import { posixNewlines } from "https://deno.land/x/handy/os/utils.ts";

posixNewlines("A\r\nB\rC"); // "A\nB\nC"
```

## `path`

Path-related utilities.

```ts
import { dir, globRoot } from "https://deno.land/x/handy/path/utils.ts";

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
  indent,
  location,
  mostConsecutive,
  sequences,
  splitOn,
  splitOnFirst,
} from "https://deno.land/x/handy/string/utils.ts";

dedent("  a\n   b\n    c"); // "a\n b\n  c"
indent("a\nb\nc", 2); // "  a\n  b\n  c"
location("a\nb\nc", 5); // { line: 2, column: 2, offset: 5 }
splitOnFirst("/", "a/b/c"); // ["a", "b/c"]
splitOn(3, "\n", "a\nb\nc\nd\ne"); // ["a", "b", "c", "d\ne"]
sequences("A", "ABAACA"); // ["A", "AA", "A"]
mostConsecutive("A", "ABAACA"); // 2
```

## `ts`

TypeScript-related utilities.

```ts
import { evaluate } from "https://deno.land/x/handy/ts/utils.ts";

await evaluate("console.log('Hello!')")
  .then((res) => res.stdout); // "Hello!"
```
