import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { afterAll, beforeAll, describe, it, test } from "@std/testing/bdd";
import { _internals } from "../../_test/_internals.ts";
import { CmdStub, stubCmd } from "../../cli/cmd.stub.ts";
import { CmdError } from "../../cli/cmd.ts";
import { dedent } from "../../string/dedent.ts";
import { describe as _describe, get, getSpan, splitLog } from "./get.ts";

const commits: Record<string, string> = {
  aaa: dedent(`
    commit aaa
    Author: Alice Adams <alice.adams@deno.land>
    Date:   Sun Apr 16 22:06:04 2023 -0700
    
        feat(io/clipboard): init; add \`copy()\` & \`paste()\``).trim(),
  bbb: dedent(`
    commit bbb
    Author: Bob Benson <bob.benson@deno.land>
    Date:   Sun Apr 16 21:26:33 2023 -0700
    
        feat(cli): init; add \`cmd()\``).trim(),
  ccc: dedent(`
    commit ccc
    Author: Carol Casper <carol.casper@deno.land>
    Date:   Sun Apr 16 18:56:45 2023 -0700

        move: \`scripts/evalCodeBlocks\` -> \`md/scripts/evalCodeBlocks\``)
    .trim(),
};

const commitDescriptions = {
  aaa: _describe(commits.aaa),
  bbb: _describe(commits.bbb),
  ccc: _describe(commits.ccc),
};

describe("splitLog", () => {
  it("splits a git log", () =>
    assertEquals(
      splitLog(`${commits.aaa}\n\n${commits.bbb}\n\n${commits.ccc}`),
      [`${commits.aaa}\n`, `${commits.bbb}\n`, commits.ccc],
    ));
});

describe("describe", () => {
  it("describes a commit", () =>
    assertEquals(_describe(commits.aaa), {
      hash: "aaa",
      author: {
        name: "Alice Adams",
        email: "alice.adams@deno.land",
      },
      date: new Date("Sun Apr 16 22:06:04 2023 -0700"),
      message: "feat(io/clipboard): init; add `copy()` & `paste()`",
    }));

  it("throws on invalid input", () => void assertThrows(() => _describe("")));
});

describe("get", () => {
  let cmdStub: CmdStub;

  beforeAll(() => {
    cmdStub = stubCmd(
      _internals,
      (command) => {
        const commit = (command as string).split(" ").at(-1)!;

        if (commit in commits) return commits[commit];

        throw new CmdError(command, "", "failed", 1);
      },
    );
  });

  it("describes a commit", async () =>
    assertEquals(await get("aaa"), commitDescriptions.aaa));

  it("throws w/o commit found", async () =>
    void await assertRejects(() => get("XXX")));

  it("throws if given a span", async () =>
    void await assertRejects(() => get("aaa..bbb")));

  it("throws if given a space", async () =>
    void await assertRejects(() => get("aaa bbb")));

  afterAll(() => cmdStub.restore());
});

describe("getSpan", () => {
  let cmdStub: CmdStub;

  beforeAll(() => {
    cmdStub = stubCmd(_internals, (command) => {
      const span = (command as string).split(" ").at(-1)!;
      const [start, end] = span.split("..");

      const _commits = Object.values(commits);

      const getIndex = (val: string) =>
        val === "ccc" || val === "HEAD"
          ? 2
          : val === "bbb"
          ? 1
          : val === "aaa"
          ? 0
          : undefined;

      const startIndex = getIndex(start);
      const endIndex = getIndex(end);

      if (startIndex !== undefined && !end) {
        return _commits[startIndex];
      } else if (startIndex === undefined || endIndex === undefined) {
        throw new CmdError(command, "", "failed", 1);
      } else if (startIndex <= endIndex) {
        return _commits
          .slice(startIndex + 1, endIndex + 1)
          .join("\n\n");
      } else {
        return "";
      }
    });
  });

  it("throws w/o start", async () =>
    void await assertRejects(() => getSpan(["XXX", "bbb"])));

  it("throws w/o end", async () =>
    void await assertRejects(() => getSpan(["aaa", "XXX"])));

  describe("without opts.inclusive", () => {
    it("describes commit span", async () =>
      assertEquals(await getSpan(["aaa", "ccc"]), [
        _describe(commits.bbb),
        _describe(commits.ccc),
      ]));

    test("[] when equal", async () =>
      assertEquals(await getSpan(["bbb", "bbb"]), []));

    test("[] when end > start", async () =>
      assertEquals(await getSpan(["bbb", "aaa"]), []));

    it("understands HEAD", async () =>
      assertEquals(await getSpan(["bbb", "HEAD"]), [
        _describe(commits.ccc),
      ]));
  });

  describe("with opts.inclusive", () => {
    it("describes commit span", async () =>
      assertEquals(await getSpan(["aaa", "bbb"], { inclusive: true }), [
        _describe(commits.aaa),
        _describe(commits.bbb),
      ]));

    test("[start] when equal", async () =>
      assertEquals(await getSpan(["bbb", "bbb"], { inclusive: true }), [
        _describe(commits.bbb),
      ]));

    test("[start] when start > end", async () =>
      assertEquals(await getSpan(["bbb", "aaa"], { inclusive: true }), [
        _describe(commits.bbb),
      ]));

    it("understands HEAD", async () =>
      assertEquals(await getSpan(["bbb", "HEAD"], { inclusive: true }), [
        _describe(commits.bbb),
        _describe(commits.ccc),
      ]));
  });

  afterAll(() => cmdStub.restore());
});
