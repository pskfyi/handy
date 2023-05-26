export type ElideOptions = {
  /** The maximum length of the returned string.
   *
   * @default 80 */
  maxLength?: number;
  /** The string to use as an ellipsis.
   *
   * @default "…" */
  ellipsis?: string;
};

/** Elide the start of a string, keeping the end.
 *
 * @example
 * elideStart("1234567890", { maxLength: 8 })
 * // "…4567890" */
export function elideStart(str: string, opts?: ElideOptions): string {
  const { maxLength = 80, ellipsis = "…" } = opts ?? {};

  if (str.length <= maxLength) return str;

  const right = str.slice(-(maxLength - ellipsis.length));

  return `${ellipsis}${right}`;
}

/** Elide the end of a string, keeping the start.
 *
 * @example
 * elideEnd("1234567890", { maxLength: 8 })
 * // "1234567…" */
export function elideEnd(str: string, opts?: ElideOptions): string {
  const { maxLength = 80, ellipsis = "…" } = opts ?? {};

  if (str.length <= maxLength) return str;

  const left = str.slice(0, maxLength - ellipsis.length);

  return `${left}${ellipsis}`;
}

/** Elide the middle of a string, keeping the start and end. If the portions
 * before and after the elided portion are not equal, the start is favored.
 *
 * @example
 * elideMiddle("1234567890", { maxLength: 8 })
 * // "1234…890" */
export function elideMiddle(str: string, opts?: ElideOptions): string {
  const { maxLength = 80, ellipsis = "…" } = opts ?? {};

  if (str.length <= maxLength) return str;

  const nonEllipsisLength = maxLength - ellipsis.length;
  const leftLength = Math.ceil(nonEllipsisLength / 2);
  const left = str.slice(0, leftLength);
  const right = str.slice(-(nonEllipsisLength - leftLength));

  return `${left}${ellipsis}${right}`;
}

/** Elide the start and end of a string, keeping the middle centered on
 * `index`. If the portions before and after the index are not equal,
 * the start is favored.
 *
 * @returns A tuple of the elided string and the `index` character's translated index position within the elided string.
 *
 * @example
 * const str = "abcdefghij";
 * const maxLength = 8;
 * const index = 5; // str[5] = "f"
 *
 * const [elided, newIndex] = elideAround(str, index, { maxLength })
 * //   "…cdefgh…",   4 (index of "f" within elided) */
export function elideAround(
  str: string,
  index: number,
  opts?: ElideOptions,
): [result: string, indexPosition: number] {
  const { maxLength = 80, ellipsis = "…" } = opts ?? {};

  if (str.length <= maxLength) return [str, index];

  const coreLength = maxLength - (ellipsis.length * 2);
  const left = index - Math.floor(coreLength / 2);
  const right = left + coreLength;

  const leftTooSmall = left <= ellipsis.length;
  if (leftTooSmall) return [elideEnd(str, opts), index];

  const rightTooLarge = right >= str.length - ellipsis.length;
  if (rightTooLarge) {
    const elided = elideStart(str, opts);

    return [elided, index - (str.length - elided.length)];
  }

  const middle = str.slice(left, right);
  const newIndex = index - left + ellipsis.length;

  return [`${ellipsis}${middle}${ellipsis}`, newIndex];
}
