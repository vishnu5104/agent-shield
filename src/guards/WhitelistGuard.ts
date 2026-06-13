import { Transaction, Decision, ShieldConfig } from '../core/types.js';

export async function checkWhitelist(
  tx: Transaction,
  config: ShieldConfig
): Promise<Decision> {
  if (!config.whitelist || config.whitelist.length === 0) {
    return { approved: true };
  }

  const normalizedMerchant = tx.merchant.trim().toLowerCase();
  const isWhitelisted = config.whitelist.some(
    item => item.trim().toLowerCase() === normalizedMerchant
  );

  if (!isWhitelisted) {
    return {
      approved: false,
      blockedBy: 'Whitelist',
      reason: `Merchant '${tx.merchant}' is not in the whitelist.`,
      details: {
        whitelist: config.whitelist,
      },
    };
  }

  return { approved: true };
}
