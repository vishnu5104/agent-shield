import { Transaction, Decision, ShieldConfig, StorageProvider } from '../core/types.js';

export async function checkDailyLimit(
  tx: Transaction,
  config: ShieldConfig,
  storage: StorageProvider
): Promise<Decision> {
  const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const currentSpend = await storage.getDailySpend(dateKey);
  const potentialSpend = currentSpend + tx.amount;

  if (potentialSpend > config.dailyLimit) {
    return {
      approved: false,
      blockedBy: 'DailyLimit',
      reason: `Transaction of $${tx.amount} exceeds daily limit of $${config.dailyLimit}. Current spend today: $${currentSpend}.`,
      details: {
        limit: config.dailyLimit,
        currentSpend,
        potentialSpend,
      },
    };
  }

  return { approved: true };
}
