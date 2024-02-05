export function deepEqual<T extends object>(a: T, b: T): boolean {
  if (typeof a !== typeof b) {
    return false;
  }
  for (const key in a) {
    if (typeof a[key] === 'object') {
      if (
        !deepEqual(
          a[key] as Record<string, unknown>,
          b[key] as Record<string, unknown>
        )
      ) {
        return false;
      }
    } else if (a[key] !== b[key]) {
      return false;
    }
  }
  for (const key in b) {
    if (!a.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}
