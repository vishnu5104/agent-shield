import { Transaction, Decision, ShieldConfig, StorageProvider } from './types';
import { MemoryStorage } from '../storage/MemoryStorage';
import { FileStorage } from '../storage/FileStorage';
import { checkDailyLimit } from '../guards/DailyLimitGuard';
import { checkWhitelist } from '../guards/WhitelistGuard';
import { checkReputation } from '../guards/ReputationGuard';
import { checkRateLimit } from '../guards/RateLimitGuard';

export class ShieldValidationError extends Error {
  public decision: Decision;

  constructor(decision: Decision) {
    super(decision.reason || 'Transaction blocked by AgentShield');
    this.name = 'ShieldValidationError';
    this.decision = decision;
    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ShieldValidationError);
    }
  }
}

export class AgentShield {
  public config: ShieldConfig;
  public storage: StorageProvider;

  constructor(config: Partial<ShieldConfig> = {}) {
    this.config = {
      dailyLimit: config.dailyLimit ?? 100, // Default: $100 per day
      whitelist: config.whitelist ?? [], // Default: empty (bypassed)
      minReputation: config.minReputation ?? 70, // Default: min 70/100 reputation
      rateLimit: config.rateLimit ?? {
        maxRequests: 5, // Default: 5 requests
        windowMs: 60000, // Default: 1 minute (60,000ms)
      },
      storagePath: config.storagePath,
    };

    if (this.config.storagePath) {
      this.storage = new FileStorage(this.config.storagePath);
    } else {
      this.storage = new MemoryStorage();
    }
  }

  /**
   * Evaluates a payment transaction against security policies
   */
  async check(tx: Transaction): Promise<Decision> {
    // Input validation
    if (typeof tx.amount !== 'number' || tx.amount <= 0) {
      const badTxDecision = {
        approved: false,
        blockedBy: 'InputValidation',
        reason: `Invalid transaction amount: ${tx.amount}. Must be a positive number.`,
      };
      await this.storage.logTransaction(tx, badTxDecision);
      return badTxDecision;
    }

    if (typeof tx.merchant !== 'string' || tx.merchant.trim() === '') {
      const badTxDecision = {
        approved: false,
        blockedBy: 'InputValidation',
        reason: 'Invalid merchant name. Must be a non-empty string.',
      };
      await this.storage.logTransaction(tx, badTxDecision);
      return badTxDecision;
    }

    // 1. Check Rate Limits (Run first to prevent spamming database/storage checks)
    const rateLimitDecision = await checkRateLimit(tx, this.config, this.storage);
    if (!rateLimitDecision.approved) {
      await this.storage.logTransaction(tx, rateLimitDecision);
      return rateLimitDecision;
    }

    // 2. Check Whitelist
    const whitelistDecision = await checkWhitelist(tx, this.config);
    if (!whitelistDecision.approved) {
      await this.storage.logTransaction(tx, whitelistDecision);
      return whitelistDecision;
    }

    // 3. Check Reputation Score
    const reputationDecision = await checkReputation(tx, this.config);
    if (!reputationDecision.approved) {
      await this.storage.logTransaction(tx, reputationDecision);
      return reputationDecision;
    }

    // 4. Check Daily Spend Limits
    const dailyLimitDecision = await checkDailyLimit(tx, this.config, this.storage);
    if (!dailyLimitDecision.approved) {
      await this.storage.logTransaction(tx, dailyLimitDecision);
      return dailyLimitDecision;
    }

    // --- Approved State Modifications ---
    const now = Date.now();
    
    // Record rate limit timestamp
    await this.storage.recordTransactionAttempt(now);

    // Add to daily spend
    const dateKey = new Date(now).toISOString().split('T')[0];
    await this.storage.addDailySpend(dateKey, tx.amount);

    const approvalDecision: Decision = {
      approved: true,
      details: {
        reputationScore: reputationDecision.details?.reputationScore,
        reputationSource: reputationDecision.details?.reputationSource,
      },
    };

    // Log the transaction
    await this.storage.logTransaction(tx, approvalDecision);
    return approvalDecision;
  }

  /**
   * Wraps an existing payment function.
   * Intercepts transaction details, runs checks, and either throws or blocks before execution.
   */
  guard<T extends (...args: any[]) => Promise<any>>(
    payFn: T,
    options: { throwOnError?: boolean } = { throwOnError: true }
  ): (...args: Parameters<T>) => Promise<ReturnType<T> | Decision> {
    return async (...args: Parameters<T>): Promise<ReturnType<T> | Decision> => {
      const tx = args[0] as Transaction;
      if (!tx || typeof tx.amount !== 'number' || typeof tx.merchant !== 'string') {
        throw new Error(
          '[AgentShield] Invalid payment signature. The first parameter must be an object with { amount: number, merchant: string }.'
        );
      }

      const decision = await this.check(tx);
      if (!decision.approved) {
        if (options.throwOnError) {
          throw new ShieldValidationError(decision);
        }
        return decision;
      }

      return await payFn(...args);
    };
  }

  /**
   * Proxies an agent object, automatically guarding its `.pay(...)` method.
   */
  protect<T extends { pay: (tx: Transaction, ...args: any[]) => Promise<any> }>(
    agent: T,
    options: { throwOnError?: boolean } = { throwOnError: true }
  ): T {
    const handler: ProxyHandler<T> = {
      get: (target, prop, receiver) => {
        const value = Reflect.get(target, prop, receiver);
        if (prop === 'pay' && typeof value === 'function') {
          return this.guard(value.bind(target), options);
        }
        return value;
      },
    };
    return new Proxy(agent, handler);
  }

  /**
   * Update the shield configuration dynamically
   */
  updateConfig(newConfig: Partial<ShieldConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      rateLimit: newConfig.rateLimit
        ? { ...this.config.rateLimit, ...newConfig.rateLimit }
        : this.config.rateLimit,
    };
  }
}
