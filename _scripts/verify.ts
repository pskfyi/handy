import { cmds } from "../cli/cmds.ts";

await cmds([
  "deno fmt",
  "deno lint",
  "deno test -A",
  "deno task test-readme",
  "deno task update-exports",
  "deno task update-readme",
]);
