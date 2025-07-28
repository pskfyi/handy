import { create as createFencedCodeblock } from "../md/codeBlock/fenced.ts";
import { frontmatter } from "./_frontmatter.ts";

/**
 * @module
 *
 * Create a Mermaid flowchart. */

export type FlowchartOptions = {
  direction?: "TB" | "TD" | "BT" | "RL" | "LR";
  title?: string;
};

/**
 * @returns a Markdown fenced codeblock containing a Mermaid flowchart
 *
 * {@link https://mermaid.js.org/syntax/flowchart.html} */
export function flowchart(
  edges: Iterable<[from: string, to: string]>,
  opts?: FlowchartOptions,
): string {
  const { direction = "LR", title } = opts ?? {};

  let code = "";

  if (title) code += frontmatter({ title });

  code += `flowchart ${direction}\n` +
    [...edges]
      .map(([to, from]) => `    ${to} --> ${from}`)
      .join("\n");

  return createFencedCodeblock(code, { lang: "mermaid" });
}
