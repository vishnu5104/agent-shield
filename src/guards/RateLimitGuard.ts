import { Transaction, Decision, ShieldConfig, StorageProvider } from '../core/types';

export async function checkRateLimit(
  tx: Transaction,
  config: ShieldConfig,
  storage: StorageProvider
): Promise<Decision> {
  if (!config.rateLimit) {
    return { approved: true };
  }

  const { maxRequests, windowMs } = config.rateLimit;
  const now = Date.now();
  const timestamps = await storage.getTransactionTimestamps();

  // Filter timestamps within the current sliding window
  const windowStart = now - windowMs;
  const activeTimestamps = timestamps.filter(t => t >= windowStart);

  if (activeTimestamps.length >= maxRequests) {
    const oldestInWindow = activeTimestamps[0];
    const msUntilReset = oldestInWindow + windowMs - now;
    const secUntilReset = Math.max(0, Math.ceil(msUntilReset / 1000));

    return {
      approved: false,
      blockedBy: 'RateLimit',
      reason: `Rate limit exceeded. Maximum allowed is ${maxRequests} transactions per ${windowMs / 1000}s. Please wait ${secUntilReset}s.`,
      details: {
        maxRequests,
        windowMs,
        activeCount: activeTimestamps.length,
        secUntilReset,
      },
    };
  }

  return { approved: true };
}
