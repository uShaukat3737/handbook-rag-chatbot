type Options = { limit: number; windowMs: number; now?: () => number };

// ponytail: in-memory fixed window, per server instance. Move to Redis/KV if you run more than one instance.
export function createRateLimiter({ limit, windowMs, now = Date.now }: Options) {
  const windows = new Map<string, { start: number; count: number }>();
  return (key: string): boolean => {
    const t = now();
    const current = windows.get(key);
    if (!current || t - current.start >= windowMs) {
      windows.set(key, { start: t, count: 1 });
      return true;
    }
    current.count += 1;
    return current.count <= limit;
  };
}
