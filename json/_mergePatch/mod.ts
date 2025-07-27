import type * as Json from "../types.ts";
import { equals, isObjectShallow } from "../utils.ts";

export const MEDIA_TYPE = "application/merge-patch+json";

/** Merges the patch into the target. If the patch is undefined, the target is
 * returned as-is. */
export function apply(
  target: Json.Value,
  patch: Json.Value,
): Json.Value {
  if (!isObjectShallow(patch)) return patch;

  const _target: Json.Object = isObjectShallow(target) ? target : {};

  Object.entries(patch).forEach(([key, value]) => {
    if (value === null) {
      if (key in _target) delete _target[key];
    } else {
      _target[key] = apply(_target[key] as Json.Value, value as Json.Value);
    }
  });

  return target;
}

/** Diffs two JSON values, returning a JSON Merge Patch which would convert the
 * first value into the second.
 *
 * @returns `undefined` if a patch cannot be produced. */
export function diff(
  before: Json.Value,
  after: Json.Value,
): Json.Value | undefined {
  if (equals(before, after)) return undefined;
  if (!isObjectShallow(before) || !isObjectShallow(after)) return after;

  const _before = before as Json.Object;
  const _after = after as Json.Object;
  const mergePatch: Json.Object = {};

  for (const k in _after) {
    const _afterValue = _after[k] as Json.Value;
    if (k in _before) {
      const _beforeValue = _before[k] as Json.Value;
      const valDiff = diff(_beforeValue, _afterValue);
      if (valDiff !== undefined) mergePatch[k] = valDiff;
    } else {
      mergePatch[k] = _afterValue;
    }
  }

  for (const k in _before) if (!(k in _after)) mergePatch[k] = null;

  return mergePatch;
}
