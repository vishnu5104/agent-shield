export interface Transaction {
  amount: number;
  merchant: string;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface Decision {
  approved: boolean;
  reason?: string;
  blockedBy?: string; // 'DailyLimit' | 'Whitelist' | 'Reputation' | 'RateLimit'
  details?: Record<string, any>;
}

export interface ShieldConfig {
  dailyLimit: number; // Daily spend limit in USD
  whitelist: string[]; // List of whitelisted merchants
  minReputation: number; // Minimum merchant reputation (0-100)
  rateLimit: {
    maxRequests: number; // Max requests allowed
    windowMs: number; // In milliseconds (e.g. 60000 for 1 minute)
  };
  storagePath?: string; // If provided, persists data to this JSON file
}

export interface LogEntry {
  id: string;
  timestamp: number;
  transaction: Transaction;
  decision: Decision;
}

export interface StorageProvider {
  getDailySpend(dateKey: string): Promise<number>;
  addDailySpend(dateKey: string, amount: number): Promise<void>;
  getTransactionTimestamps(): Promise<number[]>;
  recordTransactionAttempt(timestamp: number): Promise<void>;
  logTransaction(tx: Transaction, decision: Decision): Promise<LogEntry>;
  getLogs(limit?: number): Promise<LogEntry[]>;
  clearLogs(): Promise<void>;
}
