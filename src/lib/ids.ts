export function generateId(prefix?: string): string {
  const randomPart = crypto.randomUUID();
  return prefix ? `${prefix}-${randomPart}` : randomPart;
}
