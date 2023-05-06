export {
  dirname,
  extname,
  fromFileUrl,
  globToRegExp,
  isGlob,
  join,
  resolve,
  toFileUrl,
} from "https://deno.land/std@0.182.0/path/mod.ts";

export {
  dirname as posixDirname,
} from "https://deno.land/std@0.182.0/path/posix.ts";

export {
  dirname as windowsDirname,
} from "https://deno.land/std@0.182.0/path/win32.ts";
