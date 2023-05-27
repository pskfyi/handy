export type ConsoleSize = { columns: number; rows: number };

/** Get the size of the console or fallback to the given size. */
export function consoleSize(fallback: ConsoleSize): ConsoleSize {
  try {
    return Deno.consoleSize();
  } catch {
    return fallback;
  }
}

/** Get the width of the console as an integer count of columns. */
export function consoleWidth(fallback: number): number {
  try {
    return Deno.consoleSize().columns;
  } catch {
    return fallback;
  }
}

/** Get the height of the console as an integer count of rows. */
export function consoleHeight(fallback: number): number {
  try {
    return Deno.consoleSize().rows;
  } catch {
    return fallback;
  }
}
