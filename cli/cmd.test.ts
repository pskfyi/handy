import {
  assert,
  assertEquals,
  assertRejects,
  describe,
  it,
} from "../_deps/testing.ts";
import { cmd, CmdError } from "./cmd.ts";

describe("cmd", () => {
  it("returns stdout", async () =>
    assertEquals(
      await cmd(
        Deno.build.os === "windows"
          ? "powershell.exe echo Hello!"
          : "echo Hello!",
      ),
      "Hello!",
    ));

  it("throws custom error on fail", async () =>
    void await assertRejects(() => cmd("deno LMAO"), CmdError));

  describe("CmdError", () => {
    it("provides the command", async () =>
      void await cmd("deno LMAO")
        .catch((error) => assertEquals(error.command, "deno LMAO")));

    it("provides fullResult", async () =>
      void await cmd("deno LMAO").catch((error) => {
        assert(error instanceof CmdError);
        assertEquals(error.stdout, "");
        assertEquals(error.success, false);
        assertEquals(error.code, 1);
        assert(error.stderr.includes("unrecognized subcommand"));
      }));
  });

  describe("options.fullResult", () => {
    const fullResult = true as const;

    it("indicates success", async () =>
      assertEquals((await cmd("deno -V", { fullResult })).success, true));

    it("provides the exit code", async () =>
      assertEquals((await cmd("deno -V", { fullResult })).code, 0));

    it("provides stderr", async () =>
      assertEquals((await cmd("deno -V", { fullResult })).stderr, ""));

    it("doesn't throw", async () =>
      assertEquals((await cmd("deno LMAO", { fullResult })).success, false));
  });
});
