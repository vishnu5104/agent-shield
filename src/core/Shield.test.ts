import test from 'node:test';
import assert from 'node:assert';
import { AgentShield, ShieldValidationError } from './Shield';
import { MemoryStorage } from '../storage/MemoryStorage';

test('AgentShield SDK Unit Tests', async (t) => {
  await t.test('Daily Limits Policy', async () => {
    const shield = new AgentShield({
      dailyLimit: 50,
      minReputation: 0, // Bypass reputation
      rateLimit: { maxRequests: 99, windowMs: 60000 } // Bypass rate limiting
    });

    // Attempt first transaction (valid)
    const res1 = await shield.check({ amount: 30, merchant: 'OpenAI' });
    assert.strictEqual(res1.approved, true);

    // Attempt second transaction (exceeds total of 50)
    const res2 = await shield.check({ amount: 25, merchant: 'OpenAI' });
    assert.strictEqual(res2.approved, false);
    assert.strictEqual(res2.blockedBy, 'DailyLimit');
    assert.match(res2.reason || '', /exceeds daily limit/);

    // Check that storage recorded the daily spend as 30, not 55
    const dateKey = new Date().toISOString().split('T')[0];
    const spend = await shield.storage.getDailySpend(dateKey);
    assert.strictEqual(spend, 30);
  });

  await t.test('Merchant Whitelist Policy', async () => {
    const shield = new AgentShield({
      whitelist: ['OpenAI', 'Anthropic'],
      minReputation: 0,
      dailyLimit: 1000,
      rateLimit: { maxRequests: 99, windowMs: 60000 }
    });

    // Approved merchant
    const res1 = await shield.check({ amount: 10, merchant: 'OpenAI' });
    assert.strictEqual(res1.approved, true);

    // Case insensitivity
    const res2 = await shield.check({ amount: 10, merchant: 'anthropic' });
    assert.strictEqual(res2.approved, true);

    // Unlisted merchant
    const res3 = await shield.check({ amount: 10, merchant: 'BadMerchant' });
    assert.strictEqual(res3.approved, false);
    assert.strictEqual(res3.blockedBy, 'Whitelist');
  });

  await t.test('Merchant Reputation Policy', async () => {
    const shield = new AgentShield({
      minReputation: 80,
      dailyLimit: 1000,
      rateLimit: { maxRequests: 99, windowMs: 60000 }
    });

    // High reputation (well-known)
    const res1 = await shield.check({ amount: 10, merchant: 'OpenAI' });
    assert.strictEqual(res1.approved, true);
    assert.strictEqual(res1.details?.reputationScore, 99);

    // Low reputation (heuristic scam keyword)
    const res2 = await shield.check({ amount: 10, merchant: 'free-robux-generator' });
    assert.strictEqual(res2.approved, false);
    assert.strictEqual(res2.blockedBy, 'Reputation');
    assert.strictEqual(res2.details?.reputationScore, 15);
  });

  await t.test('Rate Limit Policy', async () => {
    const shield = new AgentShield({
      minReputation: 0,
      dailyLimit: 1000,
      rateLimit: { maxRequests: 2, windowMs: 1000 } // 2 requests per second
    });

    // 1st request
    const res1 = await shield.check({ amount: 10, merchant: 'OpenAI' });
    assert.strictEqual(res1.approved, true);

    // 2nd request
    const res2 = await shield.check({ amount: 10, merchant: 'OpenAI' });
    assert.strictEqual(res2.approved, true);

    // 3rd request (should trigger rate limit)
    const res3 = await shield.check({ amount: 10, merchant: 'OpenAI' });
    assert.strictEqual(res3.approved, false);
    assert.strictEqual(res3.blockedBy, 'RateLimit');
  });

  await t.test('Agent wrapping integrations (.guard and .protect)', async () => {
    const shield = new AgentShield({
      dailyLimit: 20,
      minReputation: 50,
      rateLimit: { maxRequests: 5, windowMs: 10000 }
    });

    // Mock wallet payment function
    const mockPayment = async (tx: { amount: number; merchant: string }, token: string) => {
      return { success: true, token, paid: tx.amount, to: tx.merchant };
    };

    // Guarded function
    const guardedPay = shield.guard(mockPayment);

    // Valid payment execution
    const res = await guardedPay({ amount: 15, merchant: 'OpenAI' }, 'secret_jwt');
    // Typescript assertion because guardedPay return type is union
    assert.deepStrictEqual(res, { success: true, token: 'secret_jwt', paid: 15, to: 'OpenAI' });

    // Blocked payment execution (should throw by default)
    await assert.rejects(
      async () => {
        await guardedPay({ amount: 10, merchant: 'OpenAI' }, 'secret_jwt'); // Exceeds daily limit (15 + 10 = 25 > 20)
      },
      (err: any) => {
        assert.ok(err instanceof ShieldValidationError);
        assert.strictEqual(err.decision.blockedBy, 'DailyLimit');
        return true;
      }
    );

    // Protect proxy verification
    const rawAgent = {
      pay: async (tx: { amount: number; merchant: string }) => {
        return `Paid ${tx.amount} to ${tx.merchant}`;
      },
      name: 'AgentX'
    };

    const protectedAgent = shield.protect(rawAgent);

    // Non-guarded methods and values pass through
    assert.strictEqual(protectedAgent.name, 'AgentX');

    // Reset daily limits by clearing storage for next check
    await shield.storage.clearLogs();

    // Valid pay through proxy
    const proxyRes = await protectedAgent.pay({ amount: 10, merchant: 'OpenAI' });
    assert.strictEqual(proxyRes, 'Paid 10 to OpenAI');

    // Invalid pay through proxy (exceeds newly cleared limit of 20 with 25)
    await assert.rejects(
      async () => {
        await protectedAgent.pay({ amount: 25, merchant: 'OpenAI' });
      },
      (err: any) => {
        assert.ok(err instanceof ShieldValidationError);
        assert.strictEqual(err.decision.blockedBy, 'DailyLimit');
        return true;
      }
    );
  });
});
