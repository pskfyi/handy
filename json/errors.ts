import type * as Json from "./types.ts";

/** Ergonomic error class for pretty printing JSON data
 *
 * @example
 * throw JsonError('Oops!', { index: 1, document: [2, 'A', true, null] })
 * // Oops!
 * //   index: 1
 * //   document:
 * //     [
 * //       2,
 * //       "A",
 * //       true,
 * //       null
 * //     ] */
export class PrettyError extends Error {
  constructor(message: string, details: Json.Object) {
    super(
      [
        message,
        ...Object.entries(details).map(
          ([key, value]) =>
            `  ${key}:` +
            ((typeof value === "object")
              ? "\n" + JSON.stringify(value, null, 2).replace(/^/gm, "    ")
              : typeof value === "string"
              ? ` "${value}"`
              : ` ${value}`),
        ),
      ].join("\n"),
    );
  }
}
