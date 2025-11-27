/**
 * gives back the number n but if not in interval, gives the closest limit
 * @param n the number
 * @param min the lower limit of the interval
 * @param max the higher limit of the interval
 * @returns wanted output
 */
export function containsBetween(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(n, max));
}
