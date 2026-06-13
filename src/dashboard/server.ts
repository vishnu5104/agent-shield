import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AgentShield } from '../core/Shield.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SDK instance for the dashboard with persistent storage
const shield = new AgentShield({
  dailyLimit: 150,
  whitelist: ['OpenAI', 'Anthropic', 'Vercel', 'AWS', 'Github', 'Stripe'],
  minReputation: 70,
  rateLimit: {
    maxRequests: 5,
    windowMs: 60000,
  },
  storagePath: './logs/dashboard-state.json',
});

// GET configuration
app.get('/api/config', (req, res) => {
  res.json(shield.config);
});

// POST configuration update
app.post('/api/config', (req, res) => {
  try {
    const { dailyLimit, whitelist, minReputation, rateLimit } = req.body;
    
    shield.updateConfig({
      dailyLimit: Number(dailyLimit),
      whitelist: Array.isArray(whitelist) ? whitelist : [],
      minReputation: Number(minReputation),
      rateLimit: rateLimit ? {
        maxRequests: Number(rateLimit.maxRequests),
        windowMs: Number(rateLimit.windowMs)
      } : undefined
    });

    res.json({ success: true, config: shield.config });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await shield.storage.getLogs(50); // get last 50 logs
    const dateKey = new Date().toISOString().split('T')[0];
    const todaySpend = await shield.storage.getDailySpend(dateKey);
    
    res.json({
      logs,
      todaySpend,
      dailyLimit: shield.config.dailyLimit
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST clear logs
app.post('/api/logs/clear', async (req, res) => {
  try {
    await shield.storage.clearLogs();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST simulate payment transaction
app.post('/api/simulate', async (req, res) => {
  try {
    const { amount, merchant } = req.body;
    
    if (amount === undefined || merchant === undefined) {
      return res.status(400).json({ error: 'Missing amount or merchant' });
    }

    const txAmount = Number(amount);
    const decision = await shield.check({
      amount: txAmount,
      merchant: String(merchant)
    });

    res.json({
      success: decision.approved,
      decision,
      timestamp: Date.now()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 AgentShield Security Dashboard is running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop.\n`);
});
