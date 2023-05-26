import { mostConsecutive } from "../../string/sequence.ts";
import type { Pretty } from "../../ts/types.ts";
import * as infoString from "./infoString.ts";
import { FENCED_CODE_BLOCK_REGEX } from "./regex.ts";

export type FencedCodeBlockDetails = Pretty<
  & {
    type: "fenced";
    char: FenceChar;
    fence: string;
    code: string;
  }
  & infoString.Info
>;

export type FenceChar = "`" | "~";

export type CreateFencedOptions = Pretty<
  & {
    /** If `lang` or `meta` contain backticks, `char` will be set to "~" and
     * this option will be ignored. */
    char?: FenceChar;
  }
  & infoString.Info
>;

/** Create a fenced code block with optional language and metadata.
 *
 * @example create("Hello!")
 * // "```\nHello!\n```"
 *
 * @example create("grep foo", { char: "~" })
 * // "~~~\ngrep foo\n~~~"
 *
 * @example create("const a = 1;", { lang: "js" })
 * // "```js\nconst a = 1;\n```"
 *
 * @example create('print("Hello")', { lang: "py", meta: "a=1" })
 * // "```py a=1\nprint("Hello")\n```"
 *
 * @example create("const a: number = 1;", { char: "`", lang: "`" })
 * // "~~~`\nconst a:number = 1;\n~~~"
 * // ignored `fenced` option */
export function create(
  code: string,
  { char = "`", ...info }: CreateFencedOptions = {},
): string {
  const _infoString = infoString.stringify(info);
  _infoString.includes("`") && (char = "~");

  const fence = char.repeat(Math.max(3, mostConsecutive(char, code) + 1));

  return fence + _infoString + "\n" + code + "\n" + fence;
}

export function parse(codeBlock: string): FencedCodeBlockDetails {
  const match = codeBlock.match(FENCED_CODE_BLOCK_REGEX);
  const { fence, infoString: _infoString, code = "" } = match?.groups ?? {};
  const { lang, meta } = infoString.parse(_infoString);
  const char = fence[0] as FenceChar;
  const type = "fenced" as const;

  const data: FencedCodeBlockDetails = { type, char, fence, code };

  if (lang) data.lang = lang;
  if (meta) data.meta = meta;

  return data;
}

export function findAll(markdown: string): string[] {
  const regex = new RegExp(FENCED_CODE_BLOCK_REGEX, "gm");
  const matches = markdown.matchAll(regex);

  return [...matches].map((match) => match[0]);
}
