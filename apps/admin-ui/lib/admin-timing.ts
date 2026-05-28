const SLOW_FETCH_MS = 2_000;

/** Logs slow client fetches in development for performance QA. */
export function timedAdminFetcher<T>(label: string, fn: () => Promise<T>): () => Promise<T> {
  return async () => {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const elapsed = performance.now() - start;
      if (process.env.NODE_ENV === 'development' && elapsed > SLOW_FETCH_MS) {
        console.warn(`[ODS slow fetch] ${label}: ${Math.round(elapsed)}ms`);
      }
    }
  };
}
