import { regexp } from "../../parser/regexp.ts";
import { line } from "../../parser/named.ts";
import { Text } from "../../string/Text.ts";
import { mostConsecutive } from "../../string/sequence.ts";
import type { Pretty } from "../../ts/types.ts";
import * as infoString from "./infoString.ts";

export type FencedCodeBlockDetails = Pretty<
  & {
    type: "fenced";
    fence: string;
    code: string;
  }
  & infoString.Info
>;

export type FencedCodeBlockSearchResult = [
  details: FencedCodeBlockDetails,
  location: Text.Location,
];

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

const fence = regexp(/^(?<fence>`{3,}|~{3,})([\s\S]*?)(\r?\n|\r)^\k<fence>/m)
  .groups(1, 2)
  .toObject("fence", "data");

export const parser = fence
  .into(({ fence, data }) => {
    const [{ lang, meta }, cursor] = infoString.parser.parse(data);
    const code = cursor.remainder;
    const type = "fenced" as const;

    const details: FencedCodeBlockDetails = { type, fence, code };

    if (lang) details.lang = lang;
    if (meta) details.meta = meta;

    return details;
  })
  .named("md.codeBlock.fenced");

export function parse(codeBlock: string): FencedCodeBlockDetails {
  return parser.parse(codeBlock)[0];
}

export function findAll(markdown: string): FencedCodeBlockSearchResult[] {
  const [results] = parser.node.or(line.ignore).zeroOrMore
    .parse(markdown);

  return results.map(({ value: details, start }) => [details, start]);
}
