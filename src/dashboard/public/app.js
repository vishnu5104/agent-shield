document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const configForm = document.getElementById('config-form');
  const dailyLimitInput = document.getElementById('daily-limit');
  const minReputationInput = document.getElementById('min-reputation');
  const reputationVal = document.getElementById('reputation-val');
  const whitelistInput = document.getElementById('whitelist-input');
  const rateLimitMaxInput = document.getElementById('rate-limit-max');
  const rateLimitWindowInput = document.getElementById('rate-limit-window');

  const simulatorForm = document.getElementById('simulator-form');
  const simMerchantInput = document.getElementById('sim-merchant');
  const simAmountInput = document.getElementById('sim-amount');
  const simulateBtn = document.getElementById('simulate-btn');

  const simulationOutput = document.getElementById('simulation-output');
  const decisionStatus = document.getElementById('decision-status');
  const decisionBlockedBy = document.getElementById('decision-blocked-by');
  const decisionBlockRow = document.getElementById('decision-block-row');
  const decisionReason = document.getElementById('decision-reason');
  const decisionReputation = document.getElementById('decision-reputation');
  const decisionRepRow = document.getElementById('decision-rep-row');

  const budgetSpentText = document.getElementById('budget-spent-text');
  const budgetLimitText = document.getElementById('budget-limit-text');
  const budgetProgressCircle = document.getElementById('budget-progress-circle');

  const policyDescDaily = document.getElementById('policy-desc-daily');
  const policyDescWhitelist = document.getElementById('policy-desc-whitelist');
  const policyDescReputation = document.getElementById('policy-desc-reputation');
  const policyDescRate = document.getElementById('policy-desc-rate');

  const logsTbody = document.getElementById('logs-tbody');
  const clearLogsBtn = document.getElementById('clear-logs-btn');

  // Track state
  let currentConfig = null;

  // Initialize
  fetchConfig();
  fetchLogs();
  
  // Poll logs and spending every 2 seconds
  setInterval(fetchLogs, 2000);

  // Reputation slider change
  minReputationInput.addEventListener('input', (e) => {
    reputationVal.textContent = `${e.target.value}/100`;
  });

  // Load config from server
  async function fetchConfig() {
    try {
      const response = await fetch('/api/config');
      const config = await response.json();
      currentConfig = config;

      // Populate form fields
      dailyLimitInput.value = config.dailyLimit;
      minReputationInput.value = config.minReputation;
      reputationVal.textContent = `${config.minReputation}/100`;
      whitelistInput.value = config.whitelist.join(', ');
      rateLimitMaxInput.value = config.rateLimit.maxRequests;
      rateLimitWindowInput.value = config.rateLimit.windowMs / 1000;

      updatePolicyIndicators(config);
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  }

  // Update policy status badges on right card
  function updatePolicyIndicators(config) {
    budgetLimitText.textContent = `$${config.dailyLimit}`;
    policyDescDaily.textContent = `Active (Limit: $${config.dailyLimit})`;
    
    if (config.whitelist && config.whitelist.length > 0) {
      document.getElementById('policy-status-whitelist').classList.remove('disabled');
      policyDescWhitelist.textContent = `Active (${config.whitelist.length} merchants)`;
    } else {
      document.getElementById('policy-status-whitelist').classList.add('disabled');
      policyDescWhitelist.textContent = 'Bypassed (Empty whitelist)';
    }

    if (config.minReputation > 0) {
      document.getElementById('policy-status-reputation').classList.remove('disabled');
      policyDescReputation.textContent = `Active (Min: ${config.minReputation}/100)`;
    } else {
      document.getElementById('policy-status-reputation').classList.add('disabled');
      policyDescReputation.textContent = 'Disabled (Threshold 0)';
    }

    policyDescRate.textContent = `Active (${config.rateLimit.maxRequests} tx / ${config.rateLimit.windowMs / 1000}s)`;
  }

  // Save config form submit
  configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('save-config-btn');
    const originalHtml = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;

    const whitelistArray = whitelistInput.value
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');

    const bodyData = {
      dailyLimit: Number(dailyLimitInput.value),
      minReputation: Number(minReputationInput.value),
      whitelist: whitelistArray,
      rateLimit: {
        maxRequests: Number(rateLimitMaxInput.value),
        windowMs: Number(rateLimitWindowInput.value) * 1000
      }
    };

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        currentConfig = data.config;
        updatePolicyIndicators(data.config);
        
        saveBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Applied Successfully!';
        saveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        
        setTimeout(() => {
          saveBtn.innerHTML = originalHtml;
          saveBtn.style.background = '';
          saveBtn.disabled = false;
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving config:', err);
      saveBtn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Save Failed';
      setTimeout(() => {
        saveBtn.innerHTML = originalHtml;
        saveBtn.disabled = false;
      }, 1500);
    }
  });

  // Sandbox Presets / Templates clicks
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      simMerchantInput.value = btn.getAttribute('data-merchant');
      simAmountInput.value = btn.getAttribute('data-amount');
      // Briefly highlight inputs
      simMerchantInput.style.borderColor = 'var(--accent-color)';
      simAmountInput.style.borderColor = 'var(--accent-color)';
      setTimeout(() => {
        simMerchantInput.style.borderColor = '';
        simAmountInput.style.borderColor = '';
      }, 500);
    });
  });

  // Simulator Submit
  simulatorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    simulateBtn.disabled = true;
    const origHtml = simulateBtn.innerHTML;
    simulateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking policies...';

    const reqData = {
      merchant: simMerchantInput.value,
      amount: Number(simAmountInput.value)
    };

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData)
      });
      const result = await response.json();

      // Show result
      renderSimulationResult(result);
      fetchLogs(); // immediately refresh logs
    } catch (err) {
      console.error('Error running simulation:', err);
    } finally {
      simulateBtn.disabled = false;
      simulateBtn.innerHTML = origHtml;
    }
  });

  function renderSimulationResult(result) {
    simulationOutput.classList.remove('hidden');
    simulationOutput.className = 'simulation-output ' + (result.success ? 'approved' : 'blocked');

    const iconDiv = simulationOutput.querySelector('.decision-icon');
    const headlineDiv = simulationOutput.querySelector('.decision-headline');
    
    if (result.success) {
      iconDiv.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
      headlineDiv.textContent = 'PAYMENT APPROVED';
      decisionStatus.innerHTML = '<span class="badge badge-success">Approved</span>';
      decisionBlockRow.classList.add('hidden');
      decisionReason.textContent = `Transaction of $${result.decision.details?.reputationScore ? result.decision.details.reputationScore > 50 ? 'safe' : 'valid' : 'valid'} spend checks. Allowed to proceed.`;
    } else {
      iconDiv.innerHTML = '<i class="fa-solid fa-shield-halved"></i>';
      headlineDiv.textContent = 'TRANSACTION BLOCKED';
      decisionStatus.innerHTML = '<span class="badge badge-danger">Blocked</span>';
      decisionBlockRow.classList.remove('hidden');
      decisionBlockedBy.textContent = result.decision.blockedBy;
      decisionReason.textContent = result.decision.reason;
    }

    if (result.decision.details && result.decision.details.reputationScore !== undefined) {
      decisionRepRow.classList.remove('hidden');
      const rep = result.decision.details.reputationScore;
      let repBadge = 'badge-success';
      if (rep < 50) repBadge = 'badge-danger';
      else if (rep < 75) repBadge = 'badge-warning';

      decisionReputation.innerHTML = `<span class="badge ${repBadge}">${rep}/100</span> <small style="color:var(--text-secondary)">(${result.decision.details.reputationSource})</small>`;
    } else {
      decisionRepRow.classList.add('hidden');
    }
  }

  // Load and render logs/progress
  async function fetchLogs() {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();

      renderLogsTable(data.logs);
      updateBudgetMeter(data.todaySpend, data.dailyLimit);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  }

  function renderLogsTable(logs) {
    if (!logs || logs.length === 0) {
      logsTbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">No transaction events recorded. Run a simulation above!</td>
        </tr>
      `;
      return;
    }

    logsTbody.innerHTML = logs.map(log => {
      const dateStr = new Date(log.timestamp).toLocaleTimeString();
      const statusBadge = log.decision.approved 
        ? '<span class="badge badge-success">Approved</span>' 
        : '<span class="badge badge-danger">Blocked</span>';

      const blockRule = log.decision.approved 
        ? '<span style="color:var(--text-muted)">-</span>' 
        : `<span class="badge badge-danger">${log.decision.blockedBy}</span>`;

      const repScore = log.decision.details?.reputationScore || log.decision.details?.reputation?.reputationScore;
      const details = log.decision.approved 
        ? `Transaction approved.${repScore ? ` Merchant Reputation: ${repScore}/100` : ''}` 
        : log.decision.reason;

      return `
        <tr>
          <td>${dateStr}</td>
          <td class="font-mono">${log.id}</td>
          <td style="font-weight: 500">${log.transaction.merchant}</td>
          <td class="log-amount">$${log.transaction.amount.toFixed(2)}</td>
          <td>${statusBadge}</td>
          <td>${blockRule}</td>
          <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${details}">${details}</td>
        </tr>
      `;
    }).join('');
  }

  function updateBudgetMeter(spent, limit) {
    budgetSpentText.textContent = `$${spent.toFixed(2)}`;
    budgetLimitText.textContent = `$${limit}`;

    // Update circular conic-gradient
    const percentage = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
    const deg = (percentage / 100) * 360;
    
    // Choose color based on fill
    let color = 'var(--accent-color)';
    if (percentage >= 100) {
      color = 'var(--danger-color)';
    } else if (percentage > 75) {
      color = 'var(--warning-color)';
    }

    budgetProgressCircle.style.background = `conic-gradient(${color} ${deg}deg, rgba(255, 255, 255, 0.05) ${deg}deg)`;
  }

  // Clear Logs
  clearLogsBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to reset the logs and daily spending limits?')) return;
    
    try {
      const response = await fetch('/api/logs/clear', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        simulationOutput.classList.add('hidden');
        fetchLogs();
      }
    } catch (err) {
      console.error('Error clearing logs:', err);
    }
  });
});
