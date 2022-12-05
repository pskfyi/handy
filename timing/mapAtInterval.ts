/** Every `ms` milliseconds, invoke the `callback` on the next `array` item. */
export async function mapAtInterval<T, U>(
  ms: number,
  array: T[],
  callback: (item: T) => U,
): Promise<Awaited<U>[]> {
  return await Promise.all(
    array.map(async (id, i) =>
      await new Promise<Awaited<U>>((resolve) => {
        setTimeout(
          async () => resolve(await callback(id)),
          (i + 1) * ms,
        );
      })
    ),
  );
}
