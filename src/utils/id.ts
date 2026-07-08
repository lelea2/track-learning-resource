export function generateRowId(): string {
  return `row-${crypto.randomUUID()}`;
}
