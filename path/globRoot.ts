import { isGlob } from "../_deps/path.ts";

/** Given a glob pattern, return its non-glob beginning.
 *
 * @example
 * globRoot("/foo/bar/*.ts") // "/foo/bar/"
 * globRoot("C:\\\\foo\\bar\\*.ts") // "C:\\\\foo\\bar\\"
 * globRoot("foo/bar") // "foo/bar"
 */
export function globRoot(glob: string): string {
  let root = "";

  const parts = glob.split(/([\/\\])/);

  for (const i in parts) {
    const part = parts[i];
    if (isGlob(part)) return root;

    root += part;
  }

  return root;
}
