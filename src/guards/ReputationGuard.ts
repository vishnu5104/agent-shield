import { Transaction, Decision, ShieldConfig } from '../core/types';

// Predefined reputation database for well-known merchants
const REPUTATION_REGISTRY: Record<string, number> = {
  openai: 99,
  anthropic: 98,
  stripe: 99,
  github: 97,
  aws: 98,
  amazon: 98,
  vercel: 96,
  google: 99,
  microsoft: 97,
  cloudflare: 98,
  npm: 95,
  cohere: 90,
  midjourney: 88,
  elevenlabs: 88,
  resend: 92,
  railway: 90,
  render: 90,
  heroku: 90,
  supabase: 94,
  neon: 92,
  pinecone: 92,
  mongodb: 94,
};

// Words that typically indicate high-risk or suspicious merchants
const SUSPICIOUS_KEYWORDS = [
  'scam',
  'hack',
  'free-robux',
  'free-crypto',
  'giveaway',
  'win-lottery',
  'gambling',
  'casino',
  'double-your-money',
  'airdrops',
  'phish',
  'bypass',
];

// Simple deterministic hash to return consistent scores for unknown merchants
function getDeterministicScore(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Map hash to a range of 40 to 85 for generic unknown merchants
  const absHash = Math.abs(hash);
  return 40 + (absHash % 45);
}

export async function checkReputation(
  tx: Transaction,
  config: ShieldConfig
): Promise<Decision> {
  const merchantLower = tx.merchant.trim().toLowerCase();

  // 1. Check if the merchant is in our registry
  let score = REPUTATION_REGISTRY[merchantLower];
  let source = 'Registry';

  // 2. Check for suspicious keywords
  if (score === undefined) {
    const containsSuspicious = SUSPICIOUS_KEYWORDS.some(keyword =>
      merchantLower.includes(keyword)
    );
    if (containsSuspicious) {
      score = 15; // Very low score
      source = 'Heuristic (Suspicious Keyword Match)';
    }
  }

  // 3. Fallback: Deterministic scoring
  if (score === undefined) {
    score = getDeterministicScore(merchantLower);
    source = 'Heuristic (Deterministic Hash)';
  }

  const minRep = config.minReputation ?? 70;

  if (score < minRep) {
    return {
      approved: false,
      blockedBy: 'Reputation',
      reason: `Merchant '${tx.merchant}' has a reputation score of ${score}/100, which is below the minimum required threshold of ${minRep}/100 (Source: ${source}).`,
      details: {
        reputationScore: score,
        minReputation: minRep,
        reputationSource: source,
      },
    };
  }

  return {
    approved: true,
    details: {
      reputationScore: score,
      reputationSource: source,
    },
  };
}
