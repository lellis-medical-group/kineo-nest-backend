export function parseLimit(envValue: string | undefined): number | undefined {
  const parsed = Number(envValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}