export function random<T>(list: T[]): T {
  return list[randomInteger(0, list.length)];
}

export function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}
