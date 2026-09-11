/**
 * Minimal structured logging for domain events.
 *
 * Domain events (audit, retention sweeps, lifecycle) are emitted as single-line
 * JSON so any log pipeline (CloudWatch, Loki, Datadog…) can index them without
 * parsing. Keep human text out of the payload: machine-readable event names in
 * `event`, contextual fields in `data`.
 */

export function logEvent(event: string, data?: Record<string, unknown>): void {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      event,
      ...data,
    }),
  );
}

export function logError(
  event: string,
  error: unknown,
  data?: Record<string, unknown>,
): void {
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "error",
      event,
      ...data,
      error: errorMessage(error),
    }),
  );
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
