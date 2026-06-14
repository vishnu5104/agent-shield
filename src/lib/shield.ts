import { AgentShield } from '@/core/Shield';

// Ensure the shield instance is cached in development to prevent multiple instances
// being created during hot-reloads.
const globalForShield = global as unknown as {
  shield: AgentShield | undefined;
};

export const shield =
  globalForShield.shield ??
  new AgentShield({
    dailyLimit: 150,
    whitelist: ['OpenAI', 'Anthropic', 'Vercel', 'AWS', 'Github', 'Stripe'],
    minReputation: 70,
    rateLimit: {
      maxRequests: 5,
      windowMs: 60000,
    },
    storagePath: './logs/dashboard-state.json',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForShield.shield = shield;
}
