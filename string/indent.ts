export function indent(str: string, indent: string | number): string {
  indent = typeof indent === "number" ? " ".repeat(indent) : indent;
  let indented = "";
  const lines = str.split("\n");
  const lastLineIndex = String(lines.length - 1);

  for (const i in lines) {
    const line = str.split("\n")[i];
    indented += indent + line + (i === lastLineIndex ? "" : "\n");
  }

  return indented;
}
