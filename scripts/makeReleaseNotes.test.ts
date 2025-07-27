import { assertEquals } from "@std/assert";
import { afterAll, beforeAll, it } from "@std/testing/bdd";
import { _internals } from "../_test/_internals.ts";
import { type CmdStub, stubCmd } from "../cli/cmd.stub.ts";
import { dedent } from "../string/dedent.ts";
import { makeReleaseNotes } from "./makeReleaseNotes.ts";

const commits: Record<string, string> = {
  aaa: dedent(`
    commit aaa
    Author: Alice Adams <alice.adams@deno.land>
    Date:   Sun Apr 16 22:06:04 2023 -0700
    
        feat(io/clipboard): init; add \`copy()\` & \`paste()\`
        
        This is a multi-line commit message. It is a good idea to use multi-line commit messages because they are easier to read in the git log. They also make it easier to write a good commit message.

        \`\`\`ts
        import { copy } from "https://deno.land/x/handy/io/clipboard/mod.ts";

        copy("Hello, world!");
        \`\`\``).trim(),
  bbb: dedent(`
    commit bbb
    Author: Bob Benson <bob.benson@deno.land>
    Date:   Sun Apr 16 21:26:33 2023 -0700
    
        fix(cli)!: unbreak all the things`).trim(),
  ccc: dedent(`
    commit ccc
    Author: Carol Casper <carol.casper@deno.land>
    Date:   Sun Apr 16 18:56:45 2023 -0700

        move!: \`scripts/evalCodeBlocks\` -> \`md/scripts/evalCodeBlocks\``)
    .trim(),
  ddd: dedent(`
    commit ddd
    Author: David Davis <david.davis@deno.land>
    Date:   Tue Apr 18 19:14:33 2023 -0700
    
        fix: unbreak a new thing`).trim(),
};

const commitsConcat =
  `${commits.aaa}\n\n${commits.bbb}\n\n${commits.ccc}\n\n${commits.ddd}`;

let cmdStub: CmdStub;

beforeAll(() => {
  cmdStub = stubCmd(_internals, () => commitsConcat);
});

it("has breaking changes 1st", async () =>
  assertEquals(
    await makeReleaseNotes(),
    dedent(`
        * **Breaking Change** fix(cli): unbreak all the things (bbb)
        
        * **Breaking Change** move: \`scripts/evalCodeBlocks\` -> \`md/scripts/evalCodeBlocks\` (ccc)

        * feat(io/clipboard): init; add \`copy()\` & \`paste()\` (aaa)

          This is a multi-line commit message. It is a good idea to use multi-line commit messages because they are easier to read in the git log. They also make it easier to write a good commit message.

          \`\`\`ts
          import { copy } from "https://deno.land/x/handy/io/clipboard/mod.ts";

          copy("Hello, world!");
          \`\`\`

        * fix: unbreak a new thing (ddd)
      `).trim(),
  ));

it("can group by type", async () =>
  assertEquals(
    await makeReleaseNotes({ groupByType: true }),
    dedent(`
        ## Features
        
        * (io/clipboard): init; add \`copy()\` & \`paste()\` (aaa)
        
          This is a multi-line commit message. It is a good idea to use multi-line commit messages because they are easier to read in the git log. They also make it easier to write a good commit message.

          \`\`\`ts
          import { copy } from "https://deno.land/x/handy/io/clipboard/mod.ts";

          copy("Hello, world!");
          \`\`\`
        
        ## Fixes
        
        * **Breaking Change** (cli): unbreak all the things (bbb)

        * unbreak a new thing (ddd)
        
        ## Move Commits
        
        * **Breaking Change**: \`scripts/evalCodeBlocks\` -> \`md/scripts/evalCodeBlocks\` (ccc)
      `).trim(),
  ));

it("can filter types", async () =>
  assertEquals(
    await makeReleaseNotes({ types: ["fix", "move"] }),
    dedent(`
        * **Breaking Change** fix(cli): unbreak all the things (bbb)

        * **Breaking Change** move: \`scripts/evalCodeBlocks\` -> \`md/scripts/evalCodeBlocks\` (ccc)

        * fix: unbreak a new thing (ddd)
      `).trim(),
  ));

it("can order types", async () =>
  assertEquals(
    await makeReleaseNotes({ types: ["move", "fix"] }),
    dedent(`
        * **Breaking Change** move: \`scripts/evalCodeBlocks\` -> \`md/scripts/evalCodeBlocks\` (ccc)

        * **Breaking Change** fix(cli): unbreak all the things (bbb)

        * fix: unbreak a new thing (ddd)
      `).trim(),
  ));

it("can name type groups", async () =>
  assertEquals(
    await makeReleaseNotes({
      types: ["move"],
      groupByType: true,
      typeNames: { move: "Moved Files" },
    }),
    dedent(`
        ## Moved Files
      
        * **Breaking Change**: \`scripts/evalCodeBlocks\` -> \`md/scripts/evalCodeBlocks\` (ccc)
      `).trim(),
  ));

it("skips empty type groups", async () =>
  assertEquals(
    await makeReleaseNotes({
      types: ["move", "foo"],
      groupByType: true,
      typeNames: { move: "Moved Files" },
    }),
    dedent(`
        ## Moved Files
      
        * **Breaking Change**: \`scripts/evalCodeBlocks\` -> \`md/scripts/evalCodeBlocks\` (ccc)
      `).trim(),
  ));

afterAll(() => cmdStub.restore());
