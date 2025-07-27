import { assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { _internals } from "../_test/_internals.ts";
import { type CmdStub, stubCmd } from "../cli/cmd.stub.ts";
import { get, getLatest } from "./tag.ts";

describe("get", () => {
  let cmdStub: CmdStub;

  beforeAll(() => {
    cmdStub = stubCmd(_internals, (_, { cwd }) => (
      cwd === "dirExample" ? "v3\nv4\nv5" : "0.1.0\n0.2.0\n0.3.0"
    ));
  });

  it("finds the first tag here", async () =>
    assertEquals(await get(), ["0.1.0", "0.2.0", "0.3.0"]));

  it("accepts a directory", async () =>
    assertEquals(await get("dirExample"), ["v3", "v4", "v5"]));

  afterAll(() => cmdStub.restore());
});

describe("getLatest", () => {
  let cmdStub: CmdStub;

  beforeAll(() => {
    cmdStub = stubCmd(
      _internals,
      (_, { cwd }) =>
        cwd === "dirExample"
          ? "A\nZ\nB"
          : cwd === "semver"
          ? "1.0.0-alpha\n1.0.0-rc\n1.0.0\n1.0.0-beta"
          : "0.1.0\n0.2.0\n0.1.1",
    );
  });

  it("gets alphabetic last tag", async () =>
    assertEquals(await getLatest(), "0.2.0"));

  it("accepts a directory", async () =>
    assertEquals(await getLatest("dirExample"), "Z"));

  it("respects semver", async () =>
    assertEquals(await getLatest("semver"), "1.0.0"));

  afterAll(() => cmdStub.restore());
});
