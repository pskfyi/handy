import { isGlob } from "../_deps/path.ts";

/** Given a glob pattern, return its non-glob beginning. */
export function globRoot(glob: string) {
  let root = "";

  const parts = glob.split("/");
  const lastIndex = String(parts.length - 1);

  for (const i in parts) {
    const part = parts[i];
    if (isGlob(part)) return root;

    root += part;

    if (i !== lastIndex) root += "/";
  }

  return root;
}
