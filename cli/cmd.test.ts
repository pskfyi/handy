import { assert, assertEquals, assertRejects, test } from "../_deps/testing.ts";
import { cmd, CmdError } from "./cmd.ts";

const command = Deno.build.os === "windows"
  ? "powershell.exe echo Hello!"
  : "echo Hello!";

test("returns stdout", async () => assertEquals(await cmd(command), "Hello!"));

test("throws on fail", async () =>
  void await assertRejects(() => cmd("deno LMAO"), CmdError));

test("CmdError", async () => {
  await cmd("deno LMAO")
    .catch((error) => assertEquals(error.command, "deno LMAO"));

  await cmd("deno LMAO").catch((error) => {
    assert(error instanceof CmdError);
    assertEquals(error.stdout, "");
    assertEquals(error.success, false);
    assertEquals(error.code, 1);
    assert(error.stderr.includes("unrecognized subcommand"));
  });
});

test("options.fullResult", async () => {
  assertEquals((await cmd("deno -V", { fullResult: true })).success, true);
  assertEquals((await cmd("deno -V", { fullResult: true })).code, 0);
  assertEquals((await cmd("deno -V", { fullResult: true })).stderr, "");
  assertEquals((await cmd("deno LMAO", { fullResult: true })).success, false);
});
