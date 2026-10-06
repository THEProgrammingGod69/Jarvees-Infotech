type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/**
 * Run `cb` once the main thread is idle (or after `timeout` ms at the
 * latest), so deferred work never competes with first paint, hydration or
 * input. Falls back to a short timer where requestIdleCallback is missing
 * (older Safari). Returns a cancel function.
 */
export function whenIdle(cb: () => void, timeout = 1200): () => void {
  const w = window as IdleWindow;
  if (w.requestIdleCallback && w.cancelIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, Math.min(timeout, 300));
  return () => window.clearTimeout(id);
}
