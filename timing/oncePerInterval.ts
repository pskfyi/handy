/**
 * Every `ms` milliseconds, invoke the `callback` on the next `array` item.
 *
 * @returns a `Promise` resolving to the result of mapping over the `array`
 */
export async function oncePerInterval<T, U>(
  ms: number,
  array: T[],
  callback: (item: T) => U,
): Promise<Awaited<U>[]> {
  if (array.length === 0) return [];

  const arr = array.slice();
  const result: Awaited<U>[] = [];

  return await new Promise((resolve) => {
    const ID = setInterval(async () => {
      result.push(await callback(arr.shift()!));
      if (arr.length === 0) {
        clearInterval(ID);
        resolve(result);
      }
    }, ms);
  });
}
