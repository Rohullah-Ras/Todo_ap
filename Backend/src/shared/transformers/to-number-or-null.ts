export function toNumberOrNull({ value }): number | null {
  return typeof value === 'number' ||
    (typeof value === 'string' && value !== '')
    ? Number(value)
    : null;
}
