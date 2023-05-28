export function frontmatter(contents: Record<string, string>): string {
  let result = "---\n";

  for (const [key, value] of Object.entries(contents)) {
    result += `${key}: ${value}\n`;
  }

  result += "---\n";

  return result;
}
