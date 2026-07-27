export type LogLevel = 'info' | 'warn' | 'error';

export interface NewsLogContext {
  requestId?: string;
  provider?: string;
  attempt?: number;
  durationMs?: number;
  count?: number;
  stale?: boolean;
  [key: string]: unknown;
}

/** Structured server logs for news pipeline observability. */
export function newsLog(
  level: LogLevel,
  message: string,
  context: NewsLogContext = {},
): void {
  const payload = {
    ts: new Date().toISOString(),
    service: 'arb-news',
    level,
    message,
    ...context,
  };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export function createRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
