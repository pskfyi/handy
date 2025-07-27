import { assertEquals, assertRejects } from "@std/assert";
import { test } from "@std/testing/bdd";
import type { _internals } from "../../_test/_internals.ts";
import { sha } from "./sha.ts";

const ignore = Boolean(Deno.env.get("CI"));

test("repo's first commit", { ignore }, async () => {
  assertEquals(
    await sha("7700d3d"),
    "7700d3dfe17cbe5a5c0fb7360b2e336a84967fa0",
  );
});

test("impossible rev", async () => {
  void await assertRejects(() => sha("abcdefghijklmnopqrstuvwxyz"));
});

test("multiple revs", async () => {
  void await assertRejects(() => sha("a b"));
  void await assertRejects(() => sha("aaa..bbb"));
});
