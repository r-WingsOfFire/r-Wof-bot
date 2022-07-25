export function random<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
