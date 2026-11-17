// Structured JSON logs on stderr; swap for a real logger (pino, Sentry) when deploying.
export function logError(event: string, context: Record<string, unknown>): void {
  console.error(JSON.stringify({ level: 'error', time: new Date().toISOString(), event, ...context }));
}
