import { newsLog } from '@/lib/news/log';

export async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  options?: { retries?: number; baseDelayMs?: number; requestId?: string },
): Promise<T> {
  const retries = options?.retries ?? 2;
  const baseDelayMs = options?.baseDelayMs ?? 400;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const started = Date.now();
    try {
      const result = await fn();
      if (attempt > 0) {
        newsLog('info', `${label} succeeded after retry`, {
          requestId: options?.requestId,
          provider: label,
          attempt: attempt + 1,
          durationMs: Date.now() - started,
        });
      }
      return result;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      newsLog('warn', `${label} attempt failed`, {
        requestId: options?.requestId,
        provider: label,
        attempt: attempt + 1,
        durationMs: Date.now() - started,
        error: message,
      });
      if (attempt < retries) {
        const delay = baseDelayMs * 2 ** attempt;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? `${label} failed`));
}
