/** Default debounce for search / filter inputs (ms). */
export const ODS_DEBOUNCE_MS = 300;

/** Default throttle for scroll/resize handlers (ms). */
export const ODS_THROTTLE_MS = 100;

export function debounce<T extends (...args: never[]) => void>(fn: T, waitMs: number): T {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  }) as T;
}

export function throttle<T extends (...args: never[]) => void>(fn: T, waitMs: number): T {
  let last = 0;
  let trailing: ReturnType<typeof setTimeout> | undefined;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = waitMs - (now - last);
    if (remaining <= 0) {
      if (trailing) {
        clearTimeout(trailing);
        trailing = undefined;
      }
      last = now;
      fn(...args);
      return;
    }
    if (!trailing) {
      trailing = setTimeout(() => {
        last = Date.now();
        trailing = undefined;
        fn(...args);
      }, remaining);
    }
  }) as T;
}

export type VirtualRange = {
  start: number;
  end: number;
  offsetTop: number;
  totalHeight: number;
};

/** Compute visible row window for virtual lists. */
export function getVirtualRange(
  scrollTop: number,
  viewportHeight: number,
  itemCount: number,
  itemHeight: number,
  overscan = 4,
): VirtualRange {
  if (itemCount <= 0) {
    return { start: 0, end: 0, offsetTop: 0, totalHeight: 0 };
  }
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(viewportHeight / itemHeight) + overscan * 2;
  const end = Math.min(itemCount, start + visibleCount);
  return {
    start,
    end,
    offsetTop: start * itemHeight,
    totalHeight: itemCount * itemHeight,
  };
}
