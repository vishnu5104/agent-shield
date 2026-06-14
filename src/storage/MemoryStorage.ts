import { StorageProvider, Transaction, Decision, LogEntry } from '../core/types';

export class MemoryStorage implements StorageProvider {
  private dailySpend: Map<string, number> = new Map();
  private transactionTimestamps: number[] = [];
  private logs: LogEntry[] = [];

  async getDailySpend(dateKey: string): Promise<number> {
    return this.dailySpend.get(dateKey) || 0;
  }

  async addDailySpend(dateKey: string, amount: number): Promise<void> {
    const current = this.dailySpend.get(dateKey) || 0;
    this.dailySpend.set(dateKey, current + amount);
  }

  async getTransactionTimestamps(): Promise<number[]> {
    return [...this.transactionTimestamps];
  }

  async recordTransactionAttempt(timestamp: number): Promise<void> {
    this.transactionTimestamps.push(timestamp);
    // Keep only timestamps from the last 24 hours to prevent memory growth
    const oneDayAgo = timestamp - 24 * 60 * 60 * 1000;
    this.transactionTimestamps = this.transactionTimestamps.filter(t => t > oneDayAgo);
  }

  async logTransaction(tx: Transaction, decision: Decision): Promise<LogEntry> {
    const logEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      transaction: tx,
      decision,
    };
    this.logs.unshift(logEntry); // Insert at beginning (newest first)
    return logEntry;
  }

  async getLogs(limit?: number): Promise<LogEntry[]> {
    if (limit) {
      return this.logs.slice(0, limit);
    }
    return [...this.logs];
  }

  async clearLogs(): Promise<void> {
    this.dailySpend.clear();
    this.transactionTimestamps = [];
    this.logs = [];
  }
}
