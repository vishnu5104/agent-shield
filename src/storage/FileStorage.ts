import { StorageProvider, Transaction, Decision, LogEntry } from '../core/types.js';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

interface StorageData {
  dailySpend: Record<string, number>;
  transactionTimestamps: number[];
  logs: LogEntry[];
}

export class FileStorage implements StorageProvider {
  private filePath: string;
  private data: StorageData = {
    dailySpend: {},
    transactionTimestamps: [],
    logs: [],
  };
  private initialized = false;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(filePath: string) {
    this.filePath = path.resolve(filePath);
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      if (existsSync(this.filePath)) {
        const fileContent = await fs.readFile(this.filePath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          dailySpend: parsed.dailySpend || {},
          transactionTimestamps: parsed.transactionTimestamps || [],
          logs: parsed.logs || [],
        };
      } else {
        await this.saveImmediate();
      }
    } catch (err) {
      console.warn(`[AgentShield] Error reading storage file at ${this.filePath}, initializing fresh:`, err);
      this.data = { dailySpend: {}, transactionTimestamps: [], logs: [] };
      await this.saveImmediate();
    }
    this.initialized = true;
  }

  private async saveImmediate(): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`[AgentShield] Failed to write to file storage:`, err);
    }
  }

  private enqueueSave(): Promise<void> {
    this.writeQueue = this.writeQueue.then(() => this.saveImmediate());
    return this.writeQueue;
  }

  async getDailySpend(dateKey: string): Promise<number> {
    await this.ensureInitialized();
    return this.data.dailySpend[dateKey] || 0;
  }

  async addDailySpend(dateKey: string, amount: number): Promise<void> {
    await this.ensureInitialized();
    const current = this.data.dailySpend[dateKey] || 0;
    this.data.dailySpend[dateKey] = current + amount;
    await this.enqueueSave();
  }

  async getTransactionTimestamps(): Promise<number[]> {
    await this.ensureInitialized();
    return [...this.data.transactionTimestamps];
  }

  async recordTransactionAttempt(timestamp: number): Promise<void> {
    await this.ensureInitialized();
    this.data.transactionTimestamps.push(timestamp);
    // Prune entries older than 24 hours
    const oneDayAgo = timestamp - 24 * 60 * 60 * 1000;
    this.data.transactionTimestamps = this.data.transactionTimestamps.filter(t => t > oneDayAgo);
    await this.enqueueSave();
  }

  async logTransaction(tx: Transaction, decision: Decision): Promise<LogEntry> {
    await this.ensureInitialized();
    const logEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      transaction: tx,
      decision,
    };
    this.data.logs.unshift(logEntry);
    await this.enqueueSave();
    return logEntry;
  }

  async getLogs(limit?: number): Promise<LogEntry[]> {
    await this.ensureInitialized();
    if (limit) {
      return this.data.logs.slice(0, limit);
    }
    return [...this.data.logs];
  }

  async clearLogs(): Promise<void> {
    await this.ensureInitialized();
    this.data = {
      dailySpend: {},
      transactionTimestamps: [],
      logs: [],
    };
    await this.enqueueSave();
  }
}
