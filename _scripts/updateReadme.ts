import { HELP_MESSAGE as UE_HELP } from "../scripts/updateExports.ts";
import { HELP_MESSAGE as MRN_HELP } from "../scripts/makeReleaseNotes.ts";
import { replaceTextFile } from "../fs/replaceTextFile.ts";
import { codeBlock } from "@psk/handy/md";
import { fillCommentBlocks } from "../md/fillCommentBlocks.ts";
import * as env from "../env/mod.ts";
import { assertUnmodified } from "../git/asserts.ts";

function _fencedCodeBlock(content: string): string {
  return "\n" +
    codeBlock.create(content, { char: "`" }).replaceAll("\\", "\\\\") +
    "\n";
}

await replaceTextFile("./readme.md", (content) =>
  fillCommentBlocks(content, {
    "update-exports": _fencedCodeBlock(UE_HELP),
    "make-release-notes": _fencedCodeBlock(MRN_HELP),
  }));

if (env.boolean("CI")) {
  await assertUnmodified("./readme.md").catch(() => {
    console.error("The readme.md file is out of sync with script help text.");
    console.error("Locally run `deno task update-readme` and push again.");
    Deno.exit(1);
  });
}
