import { AgentShield, ShieldValidationError } from './index.js';

// ANSI colors for premium terminal outputs
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

async function runDemo() {
  console.log(bold(cyan('\n🛡️  AGENT SHIELD SDK DEMO 🛡️')));
  console.log(cyan('========================================'));
  console.log('Initializing AgentShield with the following safety rules:');
  console.log(`- Daily Limit: ${yellow('$100')}`);
  console.log(`- Whitelist: [${yellow('OpenAI, Anthropic, Vercel, AWS')}]`);
  console.log(`- Min Reputation Score: ${yellow('70/100')}`);
  console.log(`- Rate Limit: ${yellow('3 requests per 5 seconds')}\n`);

  // Initialize shield
  const shield = new AgentShield({
    dailyLimit: 100,
    whitelist: ['OpenAI', 'Anthropic', 'Vercel', 'AWS'],
    minReputation: 70,
    rateLimit: {
      maxRequests: 3,
      windowMs: 5000,
    },
    storagePath: './logs/shield-state.json', // persists state locally
  });

  // Reset logs from previous run for demo clarity
  await shield.storage.clearLogs();

  // Create a raw wallet runner
  const executePayment = async (tx: { amount: number; merchant: string }) => {
    return {
      txHash: '0x' + Math.random().toString(16).substring(2, 18),
      status: 'confirmed',
    };
  };

  // Wrap the payment mechanism with Agent Shield
  const agent = {
    name: 'AutoCoderAgent',
    pay: shield.guard(executePayment),
  };

  const attemptPayment = async (amount: number, merchant: string) => {
    console.log(bold(`👉 Agent attempting payment: $${amount} to "${merchant}"...`));
    try {
      const receipt = await agent.pay({ amount, merchant });
      console.log(green(`  ✅ Transaction Approved!`));
      console.log(`     Receipt Hash: ${(receipt as any).txHash}\n`);
    } catch (err: any) {
      if (err instanceof ShieldValidationError) {
        console.log(red(`  ❌ Transaction Blocked by Agent Shield!`));
        console.log(`     Reason: ${err.message}`);
        console.log(`     Blocked By: ${bold(err.decision.blockedBy || '')}`);
        if (err.decision.details) {
          console.log(`     Details: ${JSON.stringify(err.decision.details)}\n`);
        }
      } else {
        console.log(red(`  💥 Error: ${err.message}\n`));
      }
    }
  };

  // --- SCENARIO 1: Approved transactions ---
  console.log(bold(cyan('--- Scenario 1: Approved Payments ---')));
  await attemptPayment(30, 'OpenAI'); // OK
  await attemptPayment(40, 'Anthropic'); // OK (Total = 70)

  // --- SCENARIO 2: Whitelist Guard ---
  console.log(bold(cyan('--- Scenario 2: Whitelist Check ---')));
  await attemptPayment(10, 'Google'); // Blocked: Google is not in whitelist

  // --- SCENARIO 3: Reputation Guard ---
  // Temporarily clear whitelist so reputation gets evaluated, or add merchant to whitelist with low reputation
  console.log(yellow('Temporarily updating config: disabling whitelist (by empty whitelist) to showcase Reputation scoring...'));
  shield.updateConfig({ whitelist: [] });

  console.log(bold(cyan('--- Scenario 3: Reputation Check ---')));
  // Attempting payment to a known high-rep merchant (still works)
  await attemptPayment(10, 'Vercel'); // OK (Total = 80)
  
  // Attempting payment to a suspicious merchant name
  await attemptPayment(5, 'free-crypto-giveaway-airdrop'); // Blocked: low reputation score (15/100)
  
  // Attempting payment to an unknown domain (deterministic score ~62, below minReputation of 70)
  await attemptPayment(5, 'mysterious-vendor.net'); // Blocked: reputation score too low

  // --- SCENARIO 4: Daily Limit Guard ---
  console.log(bold(cyan('--- Scenario 4: Daily Limit Check ---')));
  // Currently spent: $30 (OpenAI) + $40 (Anthropic) + $10 (Vercel) = $80
  // Attempting to spend $30 more will exceed the $100 daily limit
  await attemptPayment(30, 'Vercel'); // Blocked: total would be $110 / limit $100

  // --- SCENARIO 5: Rate Limiting ---
  console.log(bold(cyan('--- Scenario 5: Rate Limiting Check ---')));
  console.log(yellow('Updating config to allow higher daily limit and clear rate limits state...'));
  await shield.storage.clearLogs();
  shield.updateConfig({ dailyLimit: 1000 });

  console.log('Hammering payments rapidly (Limit: 3 per 5 seconds)...');
  await attemptPayment(10, 'OpenAI'); // Request 1
  await attemptPayment(10, 'OpenAI'); // Request 2
  await attemptPayment(10, 'OpenAI'); // Request 3
  await attemptPayment(10, 'OpenAI'); // Request 4 (Should be rate limited)

  console.log(bold(cyan('\n🏁 Demo complete.')));
  console.log(`Verify the persistent audit log at: ${bold(cyan('./logs/shield-state.json'))}\n`);
}

runDemo().catch(console.error);
