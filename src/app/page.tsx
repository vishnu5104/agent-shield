'use client';

import { useState, useEffect, useRef } from 'react';

interface DecisionResult {
  success: boolean;
  decision: {
    approved: boolean;
    blockedBy?: string;
    reason: string;
    details?: {
      reputationScore?: number;
      reputationSource?: string;
    };
  };
  timestamp?: number;
}

interface LogEntry {
  id: string;
  timestamp: number;
  transaction: {
    merchant: string;
    amount: number;
  };
  decision: {
    approved: boolean;
    blockedBy?: string;
    reason: string;
    details?: {
      reputationScore?: number;
      reputationSource?: string;
    };
  };
}

export default function Dashboard() {
  // Config state
  const [dailyLimit, setDailyLimit] = useState<number>(150);
  const [minReputation, setMinReputation] = useState<number>(70);
  const [whitelist, setWhitelist] = useState<string>('');
  const [rateLimitMax, setRateLimitMax] = useState<number>(5);
  const [rateLimitWindow, setRateLimitWindow] = useState<number>(60);

  // Simulation state
  const [simMerchant, setSimMerchant] = useState<string>('');
  const [simAmount, setSimAmount] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] =
    useState<DecisionResult | null>(null);

  // Status and Logs state
  const [todaySpend, setTodaySpend] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configSaveStatus, setConfigSaveStatus] = useState<
    'idle' | 'saving' | 'success' | 'failed'
  >('idle');

  // Highlight border effect refs
  const simMerchantRef = useRef<HTMLInputElement>(null);
  const simAmountRef = useRef<HTMLInputElement>(null);

  // Initial fetch
  useEffect(() => {
    fetchConfig();
    fetchLogs();

    // Poll logs every 2 seconds
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setDailyLimit(data.dailyLimit);
      setMinReputation(data.minReputation);
      setWhitelist(data.whitelist ? data.whitelist.join(', ') : '');
      if (data.rateLimit) {
        setRateLimitMax(data.rateLimit.maxRequests);
        setRateLimitWindow(data.rateLimit.windowMs / 1000);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data.logs || []);
      setTodaySpend(data.todaySpend || 0);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSaveStatus('saving');

    const whitelistArray = whitelist
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');

    const bodyData = {
      dailyLimit,
      minReputation,
      whitelist: whitelistArray,
      rateLimit: {
        maxRequests: rateLimitMax,
        windowMs: rateLimitWindow * 1000,
      },
    };

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      if (data.success) {
        setConfigSaveStatus('success');
        setTimeout(() => setConfigSaveStatus('idle'), 1500);
      } else {
        setConfigSaveStatus('failed');
        setTimeout(() => setConfigSaveStatus('idle'), 1500);
      }
    } catch (err) {
      console.error('Error saving config:', err);
      setConfigSaveStatus('failed');
      setTimeout(() => setConfigSaveStatus('idle'), 1500);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const applyPreset = (merchant: string, amount: string) => {
    setSimMerchant(merchant);
    setSimAmount(amount);

    // Briefly highlight inputs
    if (simMerchantRef.current && simAmountRef.current) {
      simMerchantRef.current.style.borderColor = 'var(--accent-color)';
      simAmountRef.current.style.borderColor = 'var(--accent-color)';
      setTimeout(() => {
        if (simMerchantRef.current) simMerchantRef.current.style.borderColor = '';
        if (simAmountRef.current) simAmountRef.current.style.borderColor = '';
      }, 500);
    }
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: simMerchant,
          amount: Number(simAmount),
        }),
      });
      const data = await res.json();
      setSimulationResult(data);
      fetchLogs(); // refresh logs immediately
    } catch (err) {
      console.error('Error simulating transaction:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClearLogs = async () => {
    if (
      !confirm('Are you sure you want to reset the logs and daily spending limits?')
    ) {
      return;
    }

    try {
      const res = await fetch('/api/logs/clear', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(null);
        fetchLogs();
      }
    } catch (err) {
      console.error('Error clearing logs:', err);
    }
  };

  // Calculate budget utilization circle
  const percentage =
    dailyLimit > 0 ? Math.min(100, (todaySpend / dailyLimit) * 100) : 0;
  const deg = (percentage / 100) * 360;

  let progressColor = 'var(--accent-color)';
  if (percentage >= 100) {
    progressColor = 'var(--danger-color)';
  } else if (percentage > 75) {
    progressColor = 'var(--warning-color)';
  }

  const progressStyle = {
    background: `conic-gradient(${progressColor} ${deg}deg, rgba(255, 255, 255, 0.05) ${deg}deg)`,
  };

  // Whitelist count helper
  const whitelistCount = whitelist
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '').length;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-area">
          <div className="logo-shield">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div className="logo-text">
            <h1>AgentShield</h1>
            <p>Autonomous AI Agent Wallet Security Shield</p>
          </div>
        </div>
        <div className="system-status">
          <span className="status-pulse"></span>
          <span className="status-text">Shield Active</span>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Config Panel */}
        <section className="card config-card">
          <div className="card-header">
            <i className="fa-solid fa-sliders"></i>
            <h2>Security Policies</h2>
          </div>
          <form onSubmit={handleConfigSubmit} className="config-form">
            <div className="form-group">
              <label htmlFor="daily-limit">
                <span>Daily Spend Limit</span>
                <span className="label-info">Max spend per 24 hours</span>
              </label>
              <div className="input-prefix-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  id="daily-limit"
                  name="dailyLimit"
                  min="1"
                  required
                  placeholder="100"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="min-reputation">
                <span>Min Merchant Reputation</span>
                <span id="reputation-val" className="badge">
                  {minReputation}/100
                </span>
              </label>
              <input
                type="range"
                id="min-reputation"
                name="minReputation"
                min="0"
                max="100"
                step="5"
                value={minReputation}
                onChange={(e) => setMinReputation(Number(e.target.value))}
              />
              <div className="range-labels">
                <span>0 (Off)</span>
                <span>50 (Medium)</span>
                <span>100 (Paranoid)</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="whitelist-input">
                <span>Merchant Whitelist</span>
                <span className="label-info">Comma-separated merchant names</span>
              </label>
              <textarea
                id="whitelist-input"
                name="whitelist"
                rows={3}
                placeholder="OpenAI, Anthropic, AWS, Stripe"
                value={whitelist}
                onChange={(e) => setWhitelist(e.target.value)}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="rate-limit-max">Max Tx</label>
                <input
                  type="number"
                  id="rate-limit-max"
                  name="rateLimitMax"
                  min="1"
                  required
                  placeholder="5"
                  value={rateLimitMax}
                  onChange={(e) => setRateLimitMax(Number(e.target.value))}
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="rate-limit-window">Window (sec)</label>
                <input
                  type="number"
                  id="rate-limit-window"
                  name="rateLimitWindow"
                  min="1"
                  required
                  placeholder="60"
                  value={rateLimitWindow}
                  onChange={(e) => setRateLimitWindow(Number(e.target.value))}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              id="save-config-btn"
              disabled={isSavingConfig}
              style={
                configSaveStatus === 'success'
                  ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }
                  : {}
              }
            >
              {configSaveStatus === 'idle' && (
                <>
                  <i className="fa-solid fa-floppy-disk"></i> Apply Security Policies
                </>
              )}
              {configSaveStatus === 'saving' && (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                </>
              )}
              {configSaveStatus === 'success' && (
                <>
                  <i className="fa-solid fa-circle-check"></i> Applied Successfully!
                </>
              )}
              {configSaveStatus === 'failed' && (
                <>
                  <i className="fa-solid fa-circle-xmark"></i> Save Failed
                </>
              )}
            </button>
          </form>
        </section>

        {/* Middle Column: Simulator */}
        <section className="card simulator-card">
          <div className="card-header">
            <i className="fa-solid fa-terminal"></i>
            <h2>Sandbox Simulator</h2>
          </div>
          <div className="simulator-wrapper" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p className="section-desc">
              Simulate an agent invoking <code>agent.pay()</code> to test rules in real-time.
            </p>

            <div className="quick-templates">
              <span className="template-label">Presets:</span>
              <button
                type="button"
                className="btn btn-sm btn-outline template-btn"
                onClick={() => applyPreset('OpenAI', '15')}
              >
                OpenAI ($15)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline template-btn"
                onClick={() => applyPreset('unknown-hosting-xyz', '8')}
              >
                Unknown Host ($8)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline template-btn"
                onClick={() => applyPreset('free-crypto-giveaway', '5')}
              >
                Crypto AirDrop ($5)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline template-btn"
                onClick={() => applyPreset('AWS', '120')}
              >
                AWS ($120)
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="simulator-form" style={{ padding: 0 }}>
              <div className="form-row">
                <div className="form-group flex-2">
                  <label htmlFor="sim-merchant">Merchant Name / Domain</label>
                  <input
                    ref={simMerchantRef}
                    type="text"
                    id="sim-merchant"
                    required
                    placeholder="e.g. OpenAI"
                    value={simMerchant}
                    onChange={(e) => setSimMerchant(e.target.value)}
                  />
                </div>
                <div className="form-group flex-1">
                  <label htmlFor="sim-amount">Amount ($)</label>
                  <input
                    ref={simAmountRef}
                    type="number"
                    id="sim-amount"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="10"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-accent"
                id="simulate-btn"
                disabled={isSimulating}
                style={{ marginTop: '1.25rem', width: '100%' }}
              >
                {isSimulating ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Checking policies...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-play"></i> Trigger agent.pay()
                  </>
                )}
              </button>
            </form>

            {/* Decision Output Area */}
            {simulationResult && (
              <div
                id="simulation-output"
                className={`simulation-output ${
                  simulationResult.success ? 'approved' : 'blocked'
                }`}
              >
                <div className="decision-banner">
                  <div className="decision-icon">
                    {simulationResult.success ? (
                      <i className="fa-solid fa-circle-check"></i>
                    ) : (
                      <i className="fa-solid fa-shield-halved"></i>
                    )}
                  </div>
                  <div className="decision-headline">
                    {simulationResult.success ? 'PAYMENT APPROVED' : 'TRANSACTION BLOCKED'}
                  </div>
                </div>
                <div className="decision-body">
                  <div className="decision-row">
                    <span className="decision-label">Rule Decision:</span>
                    <span className="decision-val">
                      {simulationResult.success ? (
                        <span className="badge badge-success">Approved</span>
                      ) : (
                        <span className="badge badge-danger">Blocked</span>
                      )}
                    </span>
                  </div>

                  {!simulationResult.success && simulationResult.decision.blockedBy && (
                    <div className="decision-row" id="decision-block-row">
                      <span className="decision-label">Blocked By:</span>
                      <span className="decision-val badge badge-danger" id="decision-blocked-by">
                        {simulationResult.decision.blockedBy}
                      </span>
                    </div>
                  )}

                  <div className="decision-row">
                    <span className="decision-label">Security Reason:</span>
                    <span className="decision-val" id="decision-reason">
                      {simulationResult.success
                        ? `Transaction of $${
                            Number(simAmount)
                          } valid spend checks. Allowed to proceed.`
                        : simulationResult.decision.reason}
                    </span>
                  </div>

                  {simulationResult.decision.details &&
                    simulationResult.decision.details.reputationScore !== undefined && (
                      <div className="decision-row" id="decision-rep-row">
                        <span className="decision-label">Merchant Reputation:</span>
                        <span className="decision-val" id="decision-reputation">
                          <span
                            className={`badge ${
                              simulationResult.decision.details.reputationScore < 50
                                ? 'badge-danger'
                                : simulationResult.decision.details.reputationScore < 75
                                ? 'badge-warning'
                                : 'badge-success'
                            }`}
                          >
                            {simulationResult.decision.details.reputationScore}/100
                          </span>{' '}
                          <small style={{ color: 'var(--text-secondary)' }}>
                            ({simulationResult.decision.details.reputationSource})
                          </small>
                        </span>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Budget & System Status */}
        <section className="card status-card">
          <div className="card-header">
            <i className="fa-solid fa-chart-line"></i>
            <h2>Metrics & Diagnostics</h2>
          </div>
          <div className="metrics-wrapper">
            {/* Circular Progress Meter */}
            <div className="budget-progress-container">
              <div
                className="circular-progress"
                id="budget-progress-circle"
                style={progressStyle}
              >
                <div className="inner-circle">
                  <span id="budget-spent-text">${todaySpend.toFixed(2)}</span>
                  <span className="budget-total-label">
                    spent of <span id="budget-limit-text">${dailyLimit}</span>
                  </span>
                </div>
              </div>
              <h3>Daily Budget Utilization</h3>
            </div>

            {/* Policy Badges */}
            <div className="policy-status-list">
              <div className="policy-status-item" id="policy-status-daily">
                <i className="fa-solid fa-circle-check"></i>
                <div className="policy-desc">
                  <span>Daily Limit Enforcement</span>
                  <small id="policy-desc-daily">Active (Limit: ${dailyLimit})</small>
                </div>
              </div>

              <div
                className={`policy-status-item ${whitelistCount === 0 ? 'disabled' : ''}`}
                id="policy-status-whitelist"
              >
                <i
                  className="fa-solid fa-circle-check"
                  style={whitelistCount === 0 ? { color: 'var(--text-muted)' } : {}}
                ></i>
                <div className="policy-desc">
                  <span>Merchant Whitelist</span>
                  <small id="policy-desc-whitelist">
                    {whitelistCount > 0
                      ? `Active (${whitelistCount} merchants)`
                      : 'Bypassed (Empty whitelist)'}
                  </small>
                </div>
              </div>

              <div
                className={`policy-status-item ${minReputation === 0 ? 'disabled' : ''}`}
                id="policy-status-reputation"
              >
                <i
                  className="fa-solid fa-circle-check"
                  style={minReputation === 0 ? { color: 'var(--text-muted)' } : {}}
                ></i>
                <div className="policy-desc">
                  <span>Reputation Score Guard</span>
                  <small id="policy-desc-reputation">
                    {minReputation > 0
                      ? `Active (Min: ${minReputation}/100)`
                      : 'Disabled (Threshold 0)'}
                  </small>
                </div>
              </div>

              <div className="policy-status-item" id="policy-status-rate">
                <i className="fa-solid fa-circle-check"></i>
                <div className="policy-desc">
                  <span>Spam & Rate Limit Protect</span>
                  <small id="policy-desc-rate">
                    Active ({rateLimitMax} tx / {rateLimitWindow}s)
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Section: Logs */}
      <section className="card logs-card">
        <div className="card-header logs-header">
          <div className="header-left">
            <i className="fa-solid fa-list-check"></i>
            <h2>Audit & Decision Log</h2>
          </div>
          <button
            className="btn btn-sm btn-danger-outline"
            id="clear-logs-btn"
            onClick={handleClearLogs}
          >
            <i className="fa-solid fa-trash-can"></i> Clear History
          </button>
        </div>
        <div className="table-responsive">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Transaction ID</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Triggered Block</th>
                <th>Details & Reasoning</th>
              </tr>
            </thead>
            <tbody id="logs-tbody">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No transaction events recorded. Run a simulation above!
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const dateStr = new Date(log.timestamp).toLocaleTimeString();
                  const repScore =
                    log.decision.details?.reputationScore ??
                    (log.decision.details as any)?.reputation?.reputationScore;
                  const details = log.decision.approved
                    ? `Transaction approved.${
                        repScore ? ` Merchant Reputation: ${repScore}/100` : ''
                      }`
                    : log.decision.reason;

                  return (
                    <tr key={log.id}>
                      <td>{dateStr}</td>
                      <td className="font-mono">{log.id}</td>
                      <td style={{ fontWeight: 500 }}>{log.transaction.merchant}</td>
                      <td className="log-amount">${log.transaction.amount.toFixed(2)}</td>
                      <td>
                        {log.decision.approved ? (
                          <span className="badge badge-success">Approved</span>
                        ) : (
                          <span className="badge badge-danger">Blocked</span>
                        )}
                      </td>
                      <td>
                        {log.decision.approved ? (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        ) : (
                          <span className="badge badge-danger">{log.decision.blockedBy}</span>
                        )}
                      </td>
                      <td
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={details}
                      >
                        {details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
