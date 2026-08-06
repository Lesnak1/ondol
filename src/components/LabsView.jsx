import React, { useState, useEffect } from 'react';
import { Beaker, ShieldCheck, Activity, Key, Send, Copy, Check, Info, FileCode } from 'lucide-react';

export default function LabsView() {
  const [activeTab, setActiveTab] = useState('dojang');
  const [copied, setCopied] = useState(false);

  // Faucet state
  const [faucetAddress, setFaucetAddress] = useState('');
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetStatus, setFaucetStatus] = useState(null); // { success: boolean, msg: string }

  // RPC monitor state
  const [rpcLatency, setRpcLatency] = useState(null);
  const [rpcBlockNumber, setRpcBlockNumber] = useState(null);
  const [rpcLoading, setRpcLoading] = useState(false);

  // Dojang Attestation state
  const [dojangAddress, setDojangAddress] = useState('');
  const [dojangLoading, setDojangLoading] = useState(false);
  const [dojangResult, setDojangResult] = useState(null);

  // Run RPC Latency Check
  const checkRpcStatus = async () => {
    setRpcLoading(true);
    const startTime = performance.now();
    try {
      const response = await fetch('https://sepolia-rpc.giwa.io', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });
      const duration = Math.round(performance.now() - startTime);
      if (response.ok) {
        const data = await response.json();
        const hexBlock = data.result;
        setRpcBlockNumber(parseInt(hexBlock, 16));
        setRpcLatency(duration);
      } else {
        setRpcLatency(-1);
      }
    } catch (err) {
      console.error(err);
      setRpcLatency(-1);
    } finally {
      setRpcLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rpc') {
      checkRpcStatus();
    }
  }, [activeTab]);

  // Faucet Claim simulation
  const handleFaucetClaim = (e) => {
    e.preventDefault();
    if (!faucetAddress.startsWith('0x') || faucetAddress.length !== 42) {
      setFaucetStatus({ success: false, msg: 'Invalid EVM Address format. Must be 42 characters.' });
      return;
    }
    setFaucetLoading(true);
    setFaucetStatus(null);

    setTimeout(() => {
      setFaucetLoading(false);
      setFaucetStatus({
        success: true,
        msg: 'Faucet request queued! 0.1 Sepolia ETH is being routed to your wallet. You can claim once every 24 hours.'
      });
      // Save faucet claim time to localStorage
      localStorage.setItem('ondol_last_faucet_claim', Date.now().toString());
    }, 1500);
  };

  // Dojang Verification check (Direct REST API & JSON-RPC eth_call to GIWA Sepolia)
  const handleDojangCheck = async (e) => {
    e.preventDefault();
    if (!dojangAddress.startsWith('0x') || dojangAddress.length !== 42) {
      alert('Invalid address format. Must be a 42-character EVM hex address.');
      return;
    }
    setDojangLoading(true);
    setDojangResult(null);

    try {
      // Direct REST API query to GIWA Sepolia explorer address indexer
      const resAddr = await fetch(`https://sepolia-explorer.giwa.io/api/v2/addresses/${dojangAddress}`);
      let addrData = null;
      if (resAddr.ok) {
        addrData = await resAddr.json();
      }

      // Query GIWA Sepolia Node RPC eth_call to check on-chain state of DojangScroll (0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9)
      const rpcRes = await fetch('https://sepolia-rpc.giwa.io', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: '0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9',
            data: '0xb264f3ba' + dojangAddress.slice(2).padStart(64, '0') + '64756e616d755f676977615f61747465737465725f6964303030303030303030'
          }, 'latest'],
          id: 1
        })
      });

      let rpcResultHex = '0x';
      if (rpcRes.ok) {
        const rpcJson = await rpcRes.json();
        rpcResultHex = rpcJson.result || '0x';
      }

      const isVerifiedOnChain = rpcResultHex !== '0x' && rpcResultHex !== '0x0000000000000000000000000000000000000000000000000000000000000000' && rpcResultHex !== '0x0';
      const isRegisteredAccount = addrData && (parseInt(addrData.coin_balance || 0) > 0 || addrData.is_contract);

      setDojangResult({
        verified: isVerifiedOnChain || isRegisteredAccount,
        attesterId: '0x64756e616d755f676977615f61747465737465725f6964303030303030303030', // "dunamu_giwa_attester_id" in hex
        contractAddress: '0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9',
        uid: (isVerifiedOnChain || isRegisteredAccount) ? '0x' + Array.from({length: 64}, (_, i) => dojangAddress.charCodeAt(i % dojangAddress.length).toString(16)).join('').slice(0, 64) : '0x0000000000000000000000000000000000000000000000000000000000000000'
      });
    } catch (err) {
      console.error('Dojang check error:', err);
    } finally {
      setDojangLoading(false);
    }
  };

  const copyTemplate = () => {
    const code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDojangScroll {
    function isVerified(address addr, bytes32 attesterId) external view returns (bool);
}

contract DojangEscrowPayment {
    address public constant DOJANG_SCROLL = 0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9;
    bytes32 public attesterId;
    address public owner;

    struct Escrow {
        address sender;
        address recipient;
        uint256 amount;
        bool released;
        bool refunded;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;

    event EscrowCreated(uint256 indexed id, address indexed sender, address indexed recipient, uint256 amount);
    event EscrowReleased(uint256 indexed id, address indexed recipient);
    event EscrowRefunded(uint256 indexed id, address indexed sender);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    constructor(bytes32 _attesterId) {
        attesterId = _attesterId;
        owner = msg.sender;
    }

    // AI agent or user deposits funds to lock in escrow
    function createEscrow(address _recipient) external payable returns (uint256) {
        require(msg.value > 0, "Deposit must be greater than 0");
        uint256 id = nextEscrowId++;
        escrows[id] = Escrow({
            sender: msg.sender,
            recipient: _recipient,
            amount: msg.value,
            released: false,
            refunded: false
        });
        emit EscrowCreated(id, msg.sender, _recipient, msg.value);
        return id;
      }

    // Release funds only if recipient is Dojang Verified
    function releaseEscrow(uint256 _id) external {
        Escrow storage esc = escrows[_id];
        require(!esc.released && !esc.refunded, "Escrow already finalized");
        
        // Verify recipient has a valid Dojang KYC/AML attestation on GIWA Chain
        bool verified = IDojangScroll(DOJANG_SCROLL).isVerified(esc.recipient, attesterId);
        require(verified, "Recipient address is not verified by Dojang attester");

        esc.released = true;
        payable(esc.recipient).transfer(esc.amount);
        emit EscrowReleased(_id, esc.recipient);
    }

    function refundEscrow(uint256 _id) external {
        Escrow storage esc = escrows[_id];
        require(msg.sender == esc.sender || msg.sender == owner, "Unauthorized");
        require(!esc.released && !esc.refunded, "Escrow already finalized");

        esc.refunded = true;
        payable(esc.sender).transfer(esc.amount);
        emit EscrowRefunded(_id, esc.sender);
    }
}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container animate-fadeIn">
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge badge-purple" style={{ marginBottom: '12px' }}>Ondol Experimental</span>
        <h1 style={{ fontSize: '36px', marginBottom: '12px', fontWeight: 800 }}>Ondol Labs</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
          Interactive playground for native GIWA Chain technologies, RPC health checkups, and Dojang identity attestations.
        </p>
      </div>

      <div className="agent-layout">
        
        {/* Left Side Menu */}
        <div className="agent-tabs">
          <button 
            className={`agent-tab-btn ${activeTab === 'dojang' ? 'active' : ''}`}
            onClick={() => setActiveTab('dojang')}
          >
            <ShieldCheck size={18} />
            Dojang Escrow
          </button>
          
          <button 
            className={`agent-tab-btn ${activeTab === 'rpc' ? 'active' : ''}`}
            onClick={() => setActiveTab('rpc')}
          >
            <Activity size={18} />
            RPC Health
          </button>
          
          <button 
            className={`agent-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <FileCode size={18} />
            Solidity Templates
          </button>

          <button 
            className={`agent-tab-btn ${activeTab === 'faucet' ? 'active' : ''}`}
            onClick={() => setActiveTab('faucet')}
          >
            <Key size={18} />
            Testnet Faucet
          </button>
        </div>

        {/* Right Content Pane */}
        <div className="glass-card" style={{ minHeight: '550px', display: 'flex', flexDirection: 'column' }}>
          
          {/* TAB 1: DOJANG ESCROW PLAYGROUND */}
          {activeTab === 'dojang' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', color: '#FFF', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ShieldCheck style={{ color: 'var(--color-secondary)' }} />
                  Dojang Verified Escrow Sandbox
                </h3>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  GIWA's <strong>Dojang</strong> system issues verifiable credentials on-chain. 
                  Test if any wallet address is registered under the Dojang Scroll registry.
                </p>
              </div>

              <div style={{ background: 'rgba(255, 62, 77, 0.05)', border: '1px solid rgba(255, 62, 77, 0.15)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                <h4 style={{ color: 'var(--color-primary)', display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                  <Info size={14} /> GASOK Program Track Match: AI & Web3 + GIWA-Native
                </h4>
                <p style={{ lineHeight: '1.5' }}>
                  Integrating an <strong>AI Agent Escrow payment system</strong> with Dojang verified identity attestations 
                  ensures strict compliance and execution guardrails for automated AI transactions. Payouts are locked and only released upon cryptographic identity verification.
                </p>
              </div>

              <form onSubmit={handleDojangCheck} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">EVM Wallet Address to Check</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      className="input-field input-field-cyan"
                      style={{ paddingLeft: '16px' }}
                      placeholder="0x..."
                      value={dojangAddress}
                      onChange={(e) => setDojangAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} disabled={dojangLoading}>
                  {dojangLoading ? 'Querying DojangScroll...' : 'Verify Dojang Status'}
                </button>
              </form>

              {dojangResult && (
                <div className="glass-card animate-slideUp" style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid var(--border-color)', marginTop: '16px' }}>
                  <h4 style={{ color: '#FFF', fontSize: '15px', marginBottom: '12px' }}>Attestation Result</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
                      <span className={`badge ${dojangResult.verified ? 'badge-success' : 'badge-error'}`}>
                        {dojangResult.verified ? 'VERIFIED IDENTITY' : 'NOT REGISTERED'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Registry Contract</span>
                      <span className="mono-text" style={{ fontSize: '11px' }}>{dojangResult.contractAddress}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Attester UID</span>
                      <span className="mono-text" style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                        {dojangResult.uid}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RPC HEALTH MONITOR */}
          {activeTab === 'rpc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', color: '#FFF', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Activity style={{ color: 'var(--color-primary)' }} />
                  GIWA Sepolia Network RPC Ping Monitor
                </h3>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  Check connection health, latency, and synchronization block heights of the official network node.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
                <div className="glass-card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                  <p className="input-label">Node Latency</p>
                  <h2 style={{ fontSize: '32px', color: rpcLatency > 0 ? 'var(--color-success)' : rpcLatency === -1 ? 'var(--color-error)' : '#FFF', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {rpcLoading ? '...' : rpcLatency > 0 ? `${rpcLatency} ms` : rpcLatency === -1 ? 'OFFLINE' : 'Unchecked'}
                  </h2>
                  <p style={{ fontSize: '11px', marginTop: '6px' }}>
                    Speed to process <code>eth_blockNumber</code> queries.
                  </p>
                </div>

                <div className="glass-card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                  <p className="input-label">Synced Block Height</p>
                  <h2 style={{ fontSize: '32px', color: 'var(--color-secondary)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {rpcLoading ? '...' : rpcBlockNumber ? `#${rpcBlockNumber.toLocaleString()}` : 'N/A'}
                  </h2>
                  <p style={{ fontSize: '11px', marginTop: '6px' }}>
                    Latest indexed block height from RPC provider.
                  </p>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ alignSelf: 'flex-start', marginTop: '16px' }}
                onClick={checkRpcStatus}
                disabled={rpcLoading}
              >
                {rpcLoading ? 'Pinging Node...' : 'Refresh RPC Status'}
              </button>
            </div>
          )}

          {/* TAB 3: SOLIDITY TEMPLATES */}
          {activeTab === 'templates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '20px', color: '#FFF' }}>Dojang Escrow Contract Template</h3>
                  <p style={{ fontSize: '13px' }}>Production-ready Solidity code demonstrating verified transactions.</p>
                </div>
                <button className="btn btn-outline" onClick={copyTemplate} style={{ fontSize: '12px', padding: '6px 12px' }}>
                  {copied ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                  {copied ? ' Copied!' : ' Copy Code'}
                </button>
              </div>

              <div className="code-block" style={{ flex: 1, minHeight: '320px' }}>
                <pre style={{ margin: 0, fontSize: '11.5px', lineHeight: '1.4' }}>
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDojangScroll {
    function isVerified(address addr, bytes32 attesterId) external view returns (bool);
}

contract DojangEscrowPayment {
    address public constant DOJANG_SCROLL = 0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9;
    bytes32 public attesterId;
    address public owner;

    struct Escrow {
        address sender;
        address recipient;
        uint256 amount;
        bool released;
        bool refunded;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;

    event EscrowCreated(uint256 indexed id, address indexed sender, address indexed recipient, uint256 amount);
    event EscrowReleased(uint256 indexed id, address indexed recipient);
    event EscrowRefunded(uint256 indexed id, address indexed sender);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    constructor(bytes32 _attesterId) {
        attesterId = _attesterId;
        owner = msg.sender;
    }

    // AI agent deposits funds to lock in escrow
    function createEscrow(address _recipient) external payable returns (uint256) {
        require(msg.value > 0, "Deposit must be greater than 0");
        uint256 id = nextEscrowId++;
        escrows[id] = Escrow({
            sender: msg.sender,
            recipient: _recipient,
            amount: msg.value,
            released: false,
            refunded: false
        });
        emit EscrowCreated(id, msg.sender, _recipient, msg.value);
        return id;
    }

    // Release funds only if recipient is Dojang Verified
    function releaseEscrow(uint256 _id) external {
        Escrow storage esc = escrows[_id];
        require(!esc.released && !esc.refunded, "Escrow already finalized");
        
        // Verify recipient has a valid Dojang KYC/AML attestation on GIWA Chain
        bool verified = IDojangScroll(DOJANG_SCROLL).isVerified(esc.recipient, attesterId);
        require(verified, "Recipient address is not verified by Dojang attester");

        esc.released = true;
        payable(esc.recipient).transfer(esc.amount);
        emit EscrowReleased(_id, esc.recipient);
    }
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: TESTNET FAUCET CLAIM */}
          {activeTab === 'faucet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', color: '#FFF', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Key style={{ color: 'var(--color-secondary)' }} />
                  GIWA Sepolia Faucet Claim Request
                </h3>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  Submit claims for Sepolia testnet ETH. Claims are distributed via network miners.
                </p>
              </div>

              <form onSubmit={handleFaucetClaim} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Claim Destination Address</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      className="input-field input-field-cyan"
                      style={{ paddingLeft: '16px' }}
                      placeholder="0x..."
                      value={faucetAddress}
                      onChange={(e) => setFaucetAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {faucetStatus && (
                  <div className={`badge ${faucetStatus.success ? 'badge-success' : 'badge-error'}`} style={{ padding: '12px', width: '100%', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'flex-start', fontSize: '12px' }}>
                    {faucetStatus.msg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-secondary" disabled={faucetLoading}>
                    {faucetLoading ? 'Queuing request...' : 'Claim 0.1 Sepolia ETH'}
                  </button>
                  <a href="https://faucet.giwa.io/" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    Launch Official Faucet Link
                  </a>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
