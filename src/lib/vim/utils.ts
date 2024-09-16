export function repeat(count: number, fn: (i: number) => void) {
  for (let i = 0; i < count; i++) {
    fn(i);
  }
}
