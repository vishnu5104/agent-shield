module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/storage/MemoryStorage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MemoryStorage",
    ()=>MemoryStorage
]);
class MemoryStorage {
    dailySpend = new Map();
    transactionTimestamps = [];
    logs = [];
    async getDailySpend(dateKey) {
        return this.dailySpend.get(dateKey) || 0;
    }
    async addDailySpend(dateKey, amount) {
        const current = this.dailySpend.get(dateKey) || 0;
        this.dailySpend.set(dateKey, current + amount);
    }
    async getTransactionTimestamps() {
        return [
            ...this.transactionTimestamps
        ];
    }
    async recordTransactionAttempt(timestamp) {
        this.transactionTimestamps.push(timestamp);
        // Keep only timestamps from the last 24 hours to prevent memory growth
        const oneDayAgo = timestamp - 24 * 60 * 60 * 1000;
        this.transactionTimestamps = this.transactionTimestamps.filter((t)=>t > oneDayAgo);
    }
    async logTransaction(tx, decision) {
        const logEntry = {
            id: Math.random().toString(36).substring(2, 11),
            timestamp: Date.now(),
            transaction: tx,
            decision
        };
        this.logs.unshift(logEntry); // Insert at beginning (newest first)
        return logEntry;
    }
    async getLogs(limit) {
        if (limit) {
            return this.logs.slice(0, limit);
        }
        return [
            ...this.logs
        ];
    }
    async clearLogs() {
        this.dailySpend.clear();
        this.transactionTimestamps = [];
        this.logs = [];
    }
}
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/src/storage/FileStorage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileStorage",
    ()=>FileStorage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
class FileStorage {
    filePath;
    data = {
        dailySpend: {},
        transactionTimestamps: [],
        logs: []
    };
    initialized = false;
    writeQueue = Promise.resolve();
    constructor(filePath){
        this.filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(filePath);
    }
    async ensureInitialized() {
        if (this.initialized) return;
        try {
            const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(this.filePath);
            await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(dir, {
                recursive: true
            });
            if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(this.filePath)) {
                const fileContent = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readFile(this.filePath, 'utf-8');
                const parsed = JSON.parse(fileContent);
                this.data = {
                    dailySpend: parsed.dailySpend || {},
                    transactionTimestamps: parsed.transactionTimestamps || [],
                    logs: parsed.logs || []
                };
            } else {
                await this.saveImmediate();
            }
        } catch (err) {
            console.warn(`[AgentShield] Error reading storage file at ${this.filePath}, initializing fresh:`, err);
            this.data = {
                dailySpend: {},
                transactionTimestamps: [],
                logs: []
            };
            await this.saveImmediate();
        }
        this.initialized = true;
    }
    async saveImmediate() {
        try {
            await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
        } catch (err) {
            console.error(`[AgentShield] Failed to write to file storage:`, err);
        }
    }
    enqueueSave() {
        this.writeQueue = this.writeQueue.then(()=>this.saveImmediate());
        return this.writeQueue;
    }
    async getDailySpend(dateKey) {
        await this.ensureInitialized();
        return this.data.dailySpend[dateKey] || 0;
    }
    async addDailySpend(dateKey, amount) {
        await this.ensureInitialized();
        const current = this.data.dailySpend[dateKey] || 0;
        this.data.dailySpend[dateKey] = current + amount;
        await this.enqueueSave();
    }
    async getTransactionTimestamps() {
        await this.ensureInitialized();
        return [
            ...this.data.transactionTimestamps
        ];
    }
    async recordTransactionAttempt(timestamp) {
        await this.ensureInitialized();
        this.data.transactionTimestamps.push(timestamp);
        // Prune entries older than 24 hours
        const oneDayAgo = timestamp - 24 * 60 * 60 * 1000;
        this.data.transactionTimestamps = this.data.transactionTimestamps.filter((t)=>t > oneDayAgo);
        await this.enqueueSave();
    }
    async logTransaction(tx, decision) {
        await this.ensureInitialized();
        const logEntry = {
            id: Math.random().toString(36).substring(2, 11),
            timestamp: Date.now(),
            transaction: tx,
            decision
        };
        this.data.logs.unshift(logEntry);
        await this.enqueueSave();
        return logEntry;
    }
    async getLogs(limit) {
        await this.ensureInitialized();
        if (limit) {
            return this.data.logs.slice(0, limit);
        }
        return [
            ...this.data.logs
        ];
    }
    async clearLogs() {
        await this.ensureInitialized();
        this.data = {
            dailySpend: {},
            transactionTimestamps: [],
            logs: []
        };
        await this.enqueueSave();
    }
}
}),
"[project]/src/guards/DailyLimitGuard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkDailyLimit",
    ()=>checkDailyLimit
]);
async function checkDailyLimit(tx, config, storage) {
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
                potentialSpend
            }
        };
    }
    return {
        approved: true
    };
}
}),
"[project]/src/guards/WhitelistGuard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkWhitelist",
    ()=>checkWhitelist
]);
async function checkWhitelist(tx, config) {
    if (!config.whitelist || config.whitelist.length === 0) {
        return {
            approved: true
        };
    }
    const normalizedMerchant = tx.merchant.trim().toLowerCase();
    const isWhitelisted = config.whitelist.some((item)=>item.trim().toLowerCase() === normalizedMerchant);
    if (!isWhitelisted) {
        return {
            approved: false,
            blockedBy: 'Whitelist',
            reason: `Merchant '${tx.merchant}' is not in the whitelist.`,
            details: {
                whitelist: config.whitelist
            }
        };
    }
    return {
        approved: true
    };
}
}),
"[project]/src/guards/ReputationGuard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkReputation",
    ()=>checkReputation
]);
// Predefined reputation database for well-known merchants
const REPUTATION_REGISTRY = {
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
    mongodb: 94
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
    'bypass'
];
// Simple deterministic hash to return consistent scores for unknown merchants
function getDeterministicScore(str) {
    let hash = 0;
    for(let i = 0; i < str.length; i++){
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Map hash to a range of 40 to 85 for generic unknown merchants
    const absHash = Math.abs(hash);
    return 40 + absHash % 45;
}
async function checkReputation(tx, config) {
    const merchantLower = tx.merchant.trim().toLowerCase();
    // 1. Check if the merchant is in our registry
    let score = REPUTATION_REGISTRY[merchantLower];
    let source = 'Registry';
    // 2. Check for suspicious keywords
    if (score === undefined) {
        const containsSuspicious = SUSPICIOUS_KEYWORDS.some((keyword)=>merchantLower.includes(keyword));
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
                reputationSource: source
            }
        };
    }
    return {
        approved: true,
        details: {
            reputationScore: score,
            reputationSource: source
        }
    };
}
}),
"[project]/src/guards/RateLimitGuard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkRateLimit",
    ()=>checkRateLimit
]);
async function checkRateLimit(tx, config, storage) {
    if (!config.rateLimit) {
        return {
            approved: true
        };
    }
    const { maxRequests, windowMs } = config.rateLimit;
    const now = Date.now();
    const timestamps = await storage.getTransactionTimestamps();
    // Filter timestamps within the current sliding window
    const windowStart = now - windowMs;
    const activeTimestamps = timestamps.filter((t)=>t >= windowStart);
    if (activeTimestamps.length >= maxRequests) {
        const oldestInWindow = activeTimestamps[0];
        const msUntilReset = oldestInWindow + windowMs - now;
        const secUntilReset = Math.max(0, Math.ceil(msUntilReset / 1000));
        return {
            approved: false,
            blockedBy: 'RateLimit',
            reason: `Rate limit exceeded. Maximum allowed is ${maxRequests} transactions per ${windowMs / 1000}s. Please wait ${secUntilReset}s.`,
            details: {
                maxRequests,
                windowMs,
                activeCount: activeTimestamps.length,
                secUntilReset
            }
        };
    }
    return {
        approved: true
    };
}
}),
"[project]/src/core/Shield.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgentShield",
    ()=>AgentShield,
    "ShieldValidationError",
    ()=>ShieldValidationError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$storage$2f$MemoryStorage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/storage/MemoryStorage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$storage$2f$FileStorage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/storage/FileStorage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$guards$2f$DailyLimitGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/guards/DailyLimitGuard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$guards$2f$WhitelistGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/guards/WhitelistGuard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$guards$2f$ReputationGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/guards/ReputationGuard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$guards$2f$RateLimitGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/guards/RateLimitGuard.ts [app-route] (ecmascript)");
;
;
;
;
;
;
class ShieldValidationError extends Error {
    decision;
    constructor(decision){
        super(decision.reason || 'Transaction blocked by AgentShield');
        this.name = 'ShieldValidationError';
        this.decision = decision;
        // Maintains proper stack trace in V8
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ShieldValidationError);
        }
    }
}
class AgentShield {
    config;
    storage;
    constructor(config = {}){
        this.config = {
            dailyLimit: config.dailyLimit ?? 100,
            whitelist: config.whitelist ?? [],
            minReputation: config.minReputation ?? 70,
            rateLimit: config.rateLimit ?? {
                maxRequests: 5,
                windowMs: 60000
            },
            storagePath: config.storagePath
        };
        if (this.config.storagePath) {
            this.storage = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$storage$2f$FileStorage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FileStorage"](this.config.storagePath);
        } else {
            this.storage = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$storage$2f$MemoryStorage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MemoryStorage"]();
        }
    }
    /**
   * Evaluates a payment transaction against security policies
   */ async check(tx) {
        // Input validation
        if (typeof tx.amount !== 'number' || tx.amount <= 0) {
            const badTxDecision = {
                approved: false,
                blockedBy: 'InputValidation',
                reason: `Invalid transaction amount: ${tx.amount}. Must be a positive number.`
            };
            await this.storage.logTransaction(tx, badTxDecision);
            return badTxDecision;
        }
        if (typeof tx.merchant !== 'string' || tx.merchant.trim() === '') {
            const badTxDecision = {
                approved: false,
                blockedBy: 'InputValidation',
                reason: 'Invalid merchant name. Must be a non-empty string.'
            };
            await this.storage.logTransaction(tx, badTxDecision);
            return badTxDecision;
        }
        // 1. Check Rate Limits (Run first to prevent spamming database/storage checks)
        const rateLimitDecision = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$guards$2f$RateLimitGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkRateLimit"])(tx, this.config, this.storage);
        if (!rateLimitDecision.approved) {
            await this.storage.logTransaction(tx, rateLimitDecision);
            return rateLimitDecision;
        }
        // 2. Check Whitelist
        const whitelistDecision = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$guards$2f$WhitelistGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkWhitelist"])(tx, this.config);
        if (!whitelistDecision.approved) {
            await this.storage.logTransaction(tx, whitelistDecision);
            return whitelistDecision;
        }
        // 3. Check Reputation Score
        const reputationDecision = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$guards$2f$ReputationGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkReputation"])(tx, this.config);
        if (!reputationDecision.approved) {
            await this.storage.logTransaction(tx, reputationDecision);
            return reputationDecision;
        }
        // 4. Check Daily Spend Limits
        const dailyLimitDecision = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$guards$2f$DailyLimitGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkDailyLimit"])(tx, this.config, this.storage);
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
        const approvalDecision = {
            approved: true,
            details: {
                reputationScore: reputationDecision.details?.reputationScore,
                reputationSource: reputationDecision.details?.reputationSource
            }
        };
        // Log the transaction
        await this.storage.logTransaction(tx, approvalDecision);
        return approvalDecision;
    }
    /**
   * Wraps an existing payment function.
   * Intercepts transaction details, runs checks, and either throws or blocks before execution.
   */ guard(payFn, options = {
        throwOnError: true
    }) {
        return async (...args)=>{
            const tx = args[0];
            if (!tx || typeof tx.amount !== 'number' || typeof tx.merchant !== 'string') {
                throw new Error('[AgentShield] Invalid payment signature. The first parameter must be an object with { amount: number, merchant: string }.');
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
   */ protect(agent, options = {
        throwOnError: true
    }) {
        const handler = {
            get: (target, prop, receiver)=>{
                const value = Reflect.get(target, prop, receiver);
                if (prop === 'pay' && typeof value === 'function') {
                    return this.guard(value.bind(target), options);
                }
                return value;
            }
        };
        return new Proxy(agent, handler);
    }
    /**
   * Update the shield configuration dynamically
   */ updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig,
            rateLimit: newConfig.rateLimit ? {
                ...this.config.rateLimit,
                ...newConfig.rateLimit
            } : this.config.rateLimit
        };
    }
}
}),
"[project]/src/lib/shield.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shield",
    ()=>shield
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$Shield$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/Shield.ts [app-route] (ecmascript)");
;
// Ensure the shield instance is cached in development to prevent multiple instances
// being created during hot-reloads.
const globalForShield = /*TURBOPACK member replacement*/ __turbopack_context__.g;
const shield = globalForShield.shield ?? new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$Shield$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AgentShield"]({
    dailyLimit: 150,
    whitelist: [
        'OpenAI',
        'Anthropic',
        'Vercel',
        'AWS',
        'Github',
        'Stripe'
    ],
    minReputation: 70,
    rateLimit: {
        maxRequests: 5,
        windowMs: 60000
    },
    storagePath: './logs/dashboard-state.json'
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForShield.shield = shield;
}
}),
"[project]/src/app/api/config/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$shield$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/shield.ts [app-route] (ecmascript)");
;
;
async function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$shield$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shield"].config);
}
async function POST(request) {
    try {
        const body = await request.json();
        const { dailyLimit, whitelist, minReputation, rateLimit } = body;
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$shield$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shield"].updateConfig({
            dailyLimit: Number(dailyLimit),
            whitelist: Array.isArray(whitelist) ? whitelist : [],
            minReputation: Number(minReputation),
            rateLimit: rateLimit ? {
                maxRequests: Number(rateLimit.maxRequests),
                windowMs: Number(rateLimit.windowMs)
            } : undefined
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            config: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$shield$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shield"].config
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err.message
        }, {
            status: 400
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1_wra1q._.js.map