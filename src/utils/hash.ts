/**
 * Deterministic string hash (djb2). Used to derive pseudo-random but
 * reproducible field values in the mock content parser — same input always
 * produces the same output, which matters for tests and for demo stability.
 */
export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}
