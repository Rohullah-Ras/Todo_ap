export function toTrimmedStringOrNull({ value }): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}
