/**
 * Cannot contain `/`, or `~` unless followed by `0` or `1`.
 *
 * `/` is escaped as `~1`, and `~` is escaped as `~0`.
 */
export type Token = string;

/** Refers to an entire document. */
export type RootPointer = "";

/**
 * Refers to a JSON value within a document.
 *
 * Can contain any number of `JsonPointer.Token`s separated by `/`.
 * This recursive definition is not yet expressible in a TypeScript typedef.
 */
export type ChildPointer = `/${Token}`;

export type Pointer = RootPointer | ChildPointer;
