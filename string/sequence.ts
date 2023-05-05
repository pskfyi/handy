/**
 * @example
 * sequences("o", "ofoo"); // ["o", "oo"]
 * sequences("fo", "fofofosho"); // ["fofofo"]
 * sequences("123-45-678", /[^-]/) // ["123", "45", "678"] */
export function sequences(
  target: string | RegExp,
  str: string,
): string[] {
  if (!target || !str) return [];

  const pattern = typeof target === "string" ? target : target.source;
  const matches = str.match(new RegExp(`(${pattern})+`, "g"));

  return matches ? [...matches] : [];
}

/**
 * @example
 * mostConsecutive("o", "ofoo"); // 2
 * mostConsecutive("fo", "fofofosho"); // 3 */
export function mostConsecutive(
  target: string,
  str: string,
): number {
  if (!target || !str) return 0;

  const matches = str.match(new RegExp(`(${target})+`, "g"));

  if (!matches) return 0;

  let maxLength = 0;

  for (const match of matches) {
    const size = match.length;
    if (size > maxLength) maxLength = size;
  }

  return maxLength / target.length;
}
