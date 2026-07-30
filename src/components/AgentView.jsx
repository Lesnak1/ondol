import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, ShieldAlert, Sparkles, Send, RefreshCw, Key, HelpCircle, 
  Terminal, ShieldCheck, AlertCircle, User, ArrowRightLeft, FileCode, Check, Server, Download 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AgentView({ 
  apiKey, 
  onOpenSettings, 
  initialTarget, 
  initialMode // 'audit' | 'explain'
}) {
  const [activeSubTab, setActiveSubTab] = useState('audit'); // 'audit' | 'profiler' | 'chat'
  
  // Key state
  const isKeyConfigured = !!apiKey;

  // Auditor States
  const [auditAddress, setAuditAddress] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [auditSourceType, setAuditSourceType] = useState('contract'); // 'contract' | 'custom'

  // Profiler States
  const [profileTarget, setProfileTarget] = useState('');
  const [profilerLoading, setProfilerLoading] = useState(false);
  const [profilerResult, setProfilerResult] = useState('');

  // Chat States
  const [chatMessages, setChatMessages] = useState([
    { 
      role: 'assistant', 
      content: "Welcome to Ondol AI — your intelligent assistant for the GIWA Chain ecosystem. I'm trained on GIWA Chain documentation, network configuration, and the GASOK incubation program. How can I help you build, deploy, or audit today?" 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Handle quick-launch from Explorer
  useEffect(() => {
    if (initialTarget) {
      if (initialMode === 'audit') {
        setActiveSubTab('audit');
        setAuditAddress(initialTarget);
        setAuditSourceType('contract');
        runContractAudit(initialTarget);
      } else if (initialMode === 'explain') {
        setActiveSubTab('profiler');
        setProfileTarget(initialTarget);
        runProfiler(initialTarget);
      }
    }
  }, [initialTarget, initialMode]);

  // Parse custom tags from DeepSeek output
  const parseAuditOutput = (text) => {
    if (!text) return null;
    
    const gradeMatch = text.match(/\[SECURITY_GRADE:\s*([SABCDF])\]/i);
    const scoreMatch = text.match(/\[RISK_SCORE:\s*(\d+)\]/i);
    const criticalMatch = text.match(/\[CRITICAL:\s*(\d+)\]/i);
    const highMatch = text.match(/\[HIGH:\s*(\d+)\]/i);
    const mediumMatch = text.match(/\[MEDIUM:\s*(\d+)\]/i);
    const lowMatch = text.match(/\[LOW:\s*(\d+)\]/i);
    const infoMatch = text.match(/\[INFO:\s*(\d+)\]/i);

    const grade = gradeMatch ? gradeMatch[1].toUpperCase() : 'B';
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 30;
    
    // Clean tags from report text
    let cleanReport = text
      .replace(/\[SECURITY_GRADE:.*?\]/gi, '')
      .replace(/\[RISK_SCORE:.*?\]/gi, '')
      .replace(/\[CRITICAL:.*?\]/gi, '')
      .replace(/\[HIGH:.*?\]/gi, '')
      .replace(/\[MEDIUM:.*?\]/gi, '')
      .replace(/\[LOW:.*?\]/gi, '')
      .replace(/\[INFO:.*?\]/gi, '')
      .trim();

    return {
      grade,
      score,
      critical: criticalMatch ? parseInt(criticalMatch[1]) : 0,
      high: highMatch ? parseInt(highMatch[1]) : 0,
      medium: mediumMatch ? parseInt(mediumMatch[1]) : 0,
      low: lowMatch ? parseInt(lowMatch[1]) : 0,
      info: infoMatch ? parseInt(infoMatch[1]) : 0,
      report: cleanReport
    };
  };

  // Run Contract Security Audit
  const runContractAudit = async (targetAddress) => {
    const addr = targetAddress || auditAddress;
    if (!addr) return;
    if (!isKeyConfigured) {
      onOpenSettings();
      return;
    }

    setAuditLoading(true);
    setAuditResult(null);

    try {
      let sourceCodeToAudit = '';
      let contractName = 'Custom Code';

      if (auditSourceType === 'contract') {
        // Fetch contract from Blockscout
        const res = await fetch(`https://sepolia-explorer.giwa.io/api/v2/smart-contracts/${addr}`);
        if (!res.ok) throw new Error('Contract details not found. Make sure the contract is verified, or switch to Custom Code.');
        const data = await res.json();
        
        if (!data.source_code) {
          throw new Error('Contract bytecode is unverified. Switch to "Custom Solidity Code" to audit raw scripts.');
        }
        
        sourceCodeToAudit = data.source_code;
        contractName = data.name || 'Verified Smart Contract';
      } else {
        if (!customCode.trim()) throw new Error('Please enter some Solidity code to audit.');
        sourceCodeToAudit = customCode;
      }

      // Query AI Agent
      const prompt = `You are a professional EVM smart contract security auditor.
Analyze the following Solidity code and perform an in-depth security audit.
You MUST prepend the following exact tags to the very beginning of your output so we can parse them:
[SECURITY_GRADE: S/A/B/C/D/F] (S is flawless, F is extremely vulnerable)
[RISK_SCORE: 0-100] (0 is safe, 100 is critical risk)
[CRITICAL: count]
[HIGH: count]
[MEDIUM: count]
[LOW: count]
[INFO: count]

Following the tags, write a professional audit report in markdown detailing the findings. Group vulnerabilities by severity and provide suggested code fixes where needed.

Contract Name: ${contractName}
Address: ${auditSourceType === 'contract' ? addr : 'Manual Input'}

Source Code:
\`\`\`solidity
${sourceCodeToAudit}
\`\`\`
`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: 'You are a precise and thorough smart contract auditor. Only output audit metrics in the requested bracket tags, followed by the markdown report.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`AI Agent API error: ${response.statusText}`);
      }

      const resData = await response.json();
      const rawText = resData.choices[0].message.content;
      const parsed = parseAuditOutput(rawText);
      setAuditResult(parsed);

      // Trigger visual confetti if contract gets an A or S grade!
      if (parsed && (parsed.grade === 'S' || parsed.grade === 'A')) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

    } catch (err) {
      console.error(err);
      alert(err.message || 'Audit failed.');
    } finally {
      setAuditLoading(false);
    }
  };

  // Run Profiler (Wallet or Transaction)
  const runProfiler = async (target) => {
    const query = target || profileTarget;
    if (!query) return;
    if (!isKeyConfigured) {
      onOpenSettings();
      return;
    }

    setProfilerLoading(true);
    setProfilerResult('');

    try {
      const clean = query.trim();
      let prompt = '';

      if (clean.length === 66 && clean.startsWith('0x')) {
        // Fetch Tx logs from Blockscout
        const res = await fetch(`https://sepolia-explorer.giwa.io/api/v2/transactions/${clean}`);
        if (!res.ok) throw new Error('Transaction details not found on GIWA Sepolia.');
        const tx = await res.json();
        
        prompt = `Explain exactly what this EVM transaction did on GIWA Chain Sepolia in a brief, professional description.
Explain who initiated it, what contract it called, what method was run, value transferred, and key state changes or logged events.
Keep it simple, readable, and highly analytical.

Transaction details:
${JSON.stringify(tx, null, 2)}
`;
      } else if (clean.length === 42 && clean.startsWith('0x')) {
        // Fetch Address details & txs
        const resAddr = await fetch(`https://sepolia-explorer.giwa.io/api/v2/addresses/${clean}`);
        if (!resAddr.ok) throw new Error('Address not found.');
        const addr = await resAddr.json();

        const resTxs = await fetch(`https://sepolia-explorer.giwa.io/api/v2/addresses/${clean}/transactions`);
        const txs = resTxs.ok ? await resTxs.json() : { items: [] };

        prompt = `Create a professional behavioral profile of this wallet address on GIWA Chain Sepolia.
Based on their balance and recent transaction history, explain what kind of actor they are (e.g. developer deploying contracts, active DeFi participant, faucet harvester, or passive vault).
Provide details in a clear markdown report.

Address specs:
${JSON.stringify(addr, null, 2)}

Recent transaction activities:
${JSON.stringify(txs.items?.slice(0, 10), null, 2)}
`;
      } else {
        throw new Error('Unsupported profile format. Enter a 42-char address or 66-char tx hash.');
      }

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: 'You are a professional blockchain data forensic analyst.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) throw new Error('Could not get explanation from the AI agent.');
      const resData = await response.json();
      setProfilerResult(resData.choices[0].message.content);

    } catch (err) {
      console.error(err);
      alert(err.message || 'Profiling failed.');
    } finally {
      setProfilerLoading(false);
    }
  };

  // Conversational Dev Assistant Chat
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!isKeyConfigured) {
      onOpenSettings();
      return;
    }

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const messagesToSend = [
        { 
          role: 'system', 
          content: `You are a helpful, professional blockchain developer assistant specializing in the GIWA Chain ecosystem.
GIWA Chain (Global Infrastructure for Web3 Access) is built using the OP Stack by Dunamu.
Network Settings:
- Network Name: GIWA Sepolia Testnet
- Chain ID: 91342
- RPC Endpoint: https://sepolia-rpc.giwa.io
- Explorer: https://sepolia-explorer.giwa.io
- Faucet: https://faucet.giwa.io/

You are also trained on GASOK, GIWA's 5-month builder incubation & acceleration program.
Key track metrics: 
1. DeFi / RWA
2. Consumer / Social
3. GIWA-Native Ideas
4. AI / Web3
5. Mass Adoption
GASOK rewards: $20,000 grant for demoday winners, plus up to $80,000 bonus on meeting KPI goals.

Answer user questions clearly in markdown format. Be friendly and highly technical.` 
        },
        ...chatMessages.filter(x => x.role !== 'system'),
        userMsg
      ];

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: messagesToSend,
          temperature: 0.6
        })
      });

      if (!response.ok) throw new Error('API request failed.');
      const data = await response.json();
      
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error: Could not connect to the AI API server. Please confirm your API key and network connection.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Lightweight Regex Markdown Parser
  const parseMarkdown = (md) => {
    if (!md) return '';
    let html = md;
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Bullet points
    html = html.replace(/^\s*-\s+(.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    // Headers
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.*?)$/gm, '<h3>$1</h3>');
    // Clean redundant list wrappings
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    // Code blocks
    html = html.replace(/```solidity(.*?)```/gs, '<div class="code-block"><pre>$1</pre></div>');
    html = html.replace(/```javascript(.*?)```/gs, '<div class="code-block"><pre>$1</pre></div>');
    html = html.replace(/```json(.*?)```/gs, '<div class="code-block"><pre>$1</pre></div>');
    html = html.replace(/```(.*?)```/gs, '<div class="code-block"><pre>$1</pre></div>');
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="container animate-fadeIn">
      
      {/* Missing API Key Panel */}
      {!isKeyConfigured && (
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-warning)', padding: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Key size={32} style={{ color: 'var(--color-warning)' }} />
            <div>
              <h3 style={{ fontSize: '16px', color: '#FFF' }}>AI Agent API Credentials Required</h3>
              <p style={{ fontSize: '13px' }}>Configure your AI Agent API key in Settings to activate the security auditor and transaction forensics.</p>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={onOpenSettings}>
            Configure Key
          </button>
        </div>
      )}

      <div className="agent-layout">
        
        {/* Left Agent Menu */}
        <div className="agent-tabs">
          <button 
            className={`agent-tab-btn ${activeSubTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('audit')}
          >
            <ShieldAlert size={18} />
            Solidity Auditor
          </button>
          
          <button 
            className={`agent-tab-btn ${activeSubTab === 'profiler' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('profiler')}
          >
            <ArrowRightLeft size={18} />
            On-chain Profiler
          </button>
          
          <button 
            className={`agent-tab-btn ${activeSubTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('chat')}
          >
            <Bot size={18} />
            Dev Chat Agent
          </button>
        </div>

        {/* Right Sub-view */}
        <div className="glass-card" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          
          {/* TAB 1: SOLIDITY AUDITOR */}
          {activeSubTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
              <div>
                <h3 style={{ fontSize: '20px', color: '#FFF', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ShieldAlert style={{ color: 'var(--color-primary)' }} />
                  Automated Smart Contract Security Auditor
                </h3>
                <p style={{ fontSize: '13px' }}>Scans Solidity scripts for backdoors, overflow loops, and reentrancy bugs using advanced AI models.</p>
              </div>

              {/* Source toggles */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <button 
                  className={`nav-btn ${auditSourceType === 'contract' ? 'active' : ''}`}
                  onClick={() => setAuditSourceType('contract')}
                >
                  <Server size={14} /> Scan Deployed Contract
                </button>
                <button 
                  className={`nav-btn ${auditSourceType === 'custom' ? 'active' : ''}`}
                  onClick={() => setAuditSourceType('custom')}
                >
                  <Terminal size={14} /> Raw Solidity Code
                </button>
              </div>

              {auditSourceType === 'contract' ? (
                <div className="input-group">
                  <label className="input-label">Contract Address</label>
                  <div className="input-wrapper">
                    <FileCode className="input-icon" size={16} />
                    <input 
                      type="text" 
                      className="input-field input-field-cyan"
                      placeholder="0x..."
                      value={auditAddress}
                      onChange={(e) => setAuditAddress(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="input-group">
                  <label className="input-label">Paste Solidity Source Code</label>
                  <textarea 
                    className="input-field input-field-cyan" 
                    rows={8}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                    placeholder="// SPDX-License-Identifier: MIT&#10;pragma solidity ^0.8.20;&#10;&#10;contract VulnerableToken { ... }"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                  />
                </div>
              )}

              <button 
                className="btn btn-primary" 
                style={{ alignSelf: 'flex-start' }}
                onClick={() => runContractAudit()}
                disabled={auditLoading || !isKeyConfigured}
              >
                {auditLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} /> Auditing Contract Codebase...
                  </>
                ) : (
                  <>
                    <Bot size={14} /> Run AI Security Audit
                  </>
                )}
              </button>

              {/* Audit Results Presentation */}
              {auditResult && (
                <div className="glass-card animate-slideUp" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)', padding: '24px', marginTop: '16px' }}>
                  
                  {/* Scores dashboard */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      <div className={`rating-circle rating-${auditResult.grade}`}>
                        {auditResult.grade}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '18px', color: '#FFF' }}>Security Audit Dashboard</h4>
                        <p style={{ fontSize: '12px', marginBottom: '12px' }}>
                          Composite Risk Score: <strong style={{ color: 'var(--color-primary)' }}>{auditResult.score}/100</strong>
                        </p>
                        
                        {/* Vulnerability counts row */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <span className="badge badge-error">Critical: {auditResult.critical}</span>
                          <span className="badge badge-red">High: {auditResult.high}</span>
                          <span className="badge badge-purple">Med: {auditResult.medium}</span>
                          <span className="badge badge-cyan">Low: {auditResult.low}</span>
                          <span className="badge badge-success">Info: {auditResult.info}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      className="btn btn-outline" 
                      onClick={downloadAuditReport}
                      style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={14} style={{ color: 'var(--color-secondary)' }} />
                      Export Report (.md)
                    </button>
                  </div>

                  {/* Audit write-up */}
                  <div style={{ overflow: 'auto' }}>
                    {parseMarkdown(auditResult.report)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRANSACTION & WALLET PROFILER */}
          {activeSubTab === 'profiler' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
              <div>
                <h3 style={{ fontSize: '20px', color: '#FFF', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ArrowRightLeft style={{ color: 'var(--color-secondary)' }} />
                  AI Transaction Forensic & Wallet Profiler
                </h3>
                <p style={{ fontSize: '13px' }}>Translate contract interaction logs and wallet histories into readable profiles.</p>
              </div>

              <div className="input-group">
                <label className="input-label">EVM Transaction Hash or Wallet Address</label>
                <div className="input-wrapper">
                  <Terminal className="input-icon" size={16} />
                  <input 
                    type="text" 
                    className="input-field input-field-cyan"
                    placeholder="0x..."
                    value={profileTarget}
                    onChange={(e) => setProfileTarget(e.target.value)}
                  />
                </div>
              </div>

              <button 
                className="btn btn-secondary" 
                style={{ alignSelf: 'flex-start' }}
                onClick={() => runProfiler()}
                disabled={profilerLoading || !isKeyConfigured}
              >
                {profilerLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} /> Decoding Forensic Logs...
                  </>
                ) : (
                  <>
                    <Bot size={14} /> Run Behavior Analysis
                  </>
                )}
              </button>

              {profilerResult && (
                <div className="glass-card animate-slideUp" style={{ background: 'rgba(0,0,0,0.1)', padding: '24px', marginTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', color: 'var(--color-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Explainer Report</h4>
                  {parseMarkdown(profilerResult)}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEV CHAT AGENT */}
          {activeSubTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '20px', color: '#FFF', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Sparkles style={{ color: 'var(--color-secondary)' }} />
                  GIWA Developer Assistant
                </h3>
                <p style={{ fontSize: '13px' }}>Ask questions about network configurations, smart contract deployment, or Gasok requirements.</p>
              </div>

              {/* Chat bubble screen */}
              <div className="chat-messages-container" style={{ flex: 1 }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                    {msg.role === 'assistant' ? parseMarkdown(msg.content) : msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-bubble assistant" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Agent is formulating deployment scripts...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChatMessage} className="chat-input-bar">
                <input 
                  type="text" 
                  className="input-field input-field-cyan"
                  style={{ paddingLeft: '16px' }}
                  placeholder={isKeyConfigured ? "How do I deploy a smart contract to GIWA Chain?" : "Configure your AI Agent key to chat..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading || !isKeyConfigured}
                />
                <button 
                  type="submit" 
                  className="btn btn-secondary"
                  disabled={chatLoading || !isKeyConfigured}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
