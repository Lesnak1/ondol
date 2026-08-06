import React, { useState } from 'react';
import { BookOpen, Server, Award, ShieldAlert, Key, FileCode, Beaker } from 'lucide-react';

export default function DocsView() {
  const [activeDoc, setActiveDoc] = useState('settings');

  return (
    <div className="container animate-fadeIn">
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>Developer Hub</span>
        <h1 style={{ fontSize: '36px', marginBottom: '12px', fontWeight: 800 }}>Documentation Portal</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
          Explore network configuration settings, smart contract verification guides, and accelerator tracks.
        </p>
      </div>

      <div className="docs-layout">
        
        {/* Left Docs Menu */}
        <div className="docs-menu">
          <button 
            className={`docs-item ${activeDoc === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveDoc('settings')}
          >
            <Server size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Network Specs & RPC
          </button>
          
          <button 
            className={`docs-item ${activeDoc === 'dojang' ? 'active' : ''}`}
            onClick={() => setActiveDoc('dojang')}
          >
            <Beaker size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Dojang Verification
          </button>

          <button 
            className={`docs-item ${activeDoc === 'metamask' ? 'active' : ''}`}
            onClick={() => setActiveDoc('metamask')}
          >
            <Key size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Web3 Wallet Connect
          </button>
          
          <button 
            className={`docs-item ${activeDoc === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveDoc('contracts')}
          >
            <FileCode size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Verified Smart Contracts
          </button>

          <button 
            className={`docs-item ${activeDoc === 'gasok' ? 'active' : ''}`}
            onClick={() => setActiveDoc('gasok')}
          >
            <Award size={16} style={{ marginRight: '8px', display: 'inline' }} />
            GASOK Program
          </button>

          <button 
            className={`docs-item ${activeDoc === 'security' ? 'active' : ''}`}
            onClick={() => setActiveDoc('security')}
          >
            <ShieldAlert size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Security Checklist
          </button>
        </div>

        {/* Right Docs Body */}
        <div className="glass-card docs-body">
          
          {/* DOC 1: SETTINGS */}
          {activeDoc === 'settings' && (
            <div className="animate-fadeIn">
              <h2>GIWA Chain Network Specifications</h2>
              <p>GIWA Chain is a high-performance EVM-compatible Layer 2 blockchain built utilizing the OP Stack framework by Dunamu. It offers 1-second block times, low gas costs, and direct settlement to Ethereum.</p>
              
              <h4>Network Parameters:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
                <li>🌐 <strong>Network Name</strong>: GIWA Sepolia Testnet</li>
                <li>🔢 <strong>Chain ID</strong>: <code>91342</code> (Hex: <code>0x164c6</code>)</li>
                <li>🔌 <strong>RPC Endpoint</strong>: <code>https://sepolia-rpc.giwa.io</code></li>
                <li>🪙 <strong>Currency Symbol</strong>: <code>ETH</code></li>
                <li>🔎 <strong>Block Explorer URL</strong>: <a href="https://sepolia-explorer.giwa.io" target="_blank" rel="noopener noreferrer">https://sepolia-explorer.giwa.io</a></li>
                <li>💧 <strong>Official Faucet</strong>: <a href="https://faucet.giwa.io" target="_blank" rel="noopener noreferrer">https://faucet.giwa.io</a></li>
              </ul>
            </div>
          )}

          {/* DOC 2: DOJANG ATTESTATION */}
          {activeDoc === 'dojang' && (
            <div className="animate-fadeIn">
              <h2>Dojang Identity Attestation Integration</h2>
              <p>Dojang is Dunamu's native identity verification protocol. It links off-chain KYC/AML attestations to on-chain addresses without exposing personally identifiable information (PII).</p>
              
              <h4>Official Registry Contract:</h4>
              <p>Applications query the <code>DojangScroll</code> convenience contract on GIWA Sepolia:</p>
              <div className="code-block" style={{ marginBottom: '16px' }}>
                <pre>Address: 0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9</pre>
              </div>

              <h4>Solidity Verification Interface:</h4>
              <div className="code-block">
                <pre>{`interface IDojangScroll {
    function isVerified(address addr, bytes32 attesterId) external view returns (bool);
}`}</pre>
              </div>
            </div>
          )}

          {/* DOC 3: METAMASK */}
          {activeDoc === 'metamask' && (
            <div className="animate-fadeIn">
              <h2>Connecting Web3 Wallets</h2>
              <p>Ondol features 1-click Web3 wallet connection using standard EIP-1193 providers (MetaMask, Coinbase Wallet, Upbit GIWA Wallet).</p>
              
              <h4>Manual MetaMask Setup:</h4>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>Click <strong>Add Network</strong> in MetaMask, then select <strong>Add a Network Manually</strong>.</li>
                <li>Enter the following parameters:
                  <ul style={{ listStyle: 'circle', paddingLeft: '20px', marginTop: '6px' }}>
                    <li><strong>Network Name</strong>: GIWA Sepolia</li>
                    <li><strong>New RPC URL</strong>: <code>https://sepolia-rpc.giwa.io</code></li>
                    <li><strong>Chain ID</strong>: <code>91342</code></li>
                    <li><strong>Currency Symbol</strong>: <code>ETH</code></li>
                    <li><strong>Block Explorer URL</strong>: <code>https://sepolia-explorer.giwa.io</code></li>
                  </ul>
                </li>
                <li>Save and switch network. Or simply click <strong>Connect Wallet</strong> in the Ondol navbar for automatic 1-click configuration.</li>
              </ol>
            </div>
          )}

          {/* DOC: VERIFIED CONTRACTS */}
          {activeDoc === 'contracts' && (
            <div className="animate-fadeIn">
              <h2>Verified Smart Contracts on GIWA Sepolia</h2>
              <p>Ondol deploys native smart contracts compiled with Solidity <code>^0.8.20</code> on GIWA Sepolia Testnet. These contracts interface directly with Dunamu's <code>DojangScroll</code> identity attestation registry.</p>

              <h4>1. OndolDojangEscrow.sol</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>📜 <strong>Contract Source</strong>: <code>contracts/OndolDojangEscrow.sol</code></li>
                <li>📍 <strong>Deployed Address</strong>: <a href="https://sepolia-explorer.giwa.io/address/0xFE4B4F5F2F8843DC9CA75E563F2F7EB0F44AE83E" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>0xFE4B4F5F2F8843DC9CA75E563F2F7EB0F44AE83E</a></li>
                <li>🎯 <strong>Target Chain</strong>: GIWA Sepolia (Chain ID: <code>91342</code>)</li>
                <li>🏛️ <strong>Dojang Scroll Address</strong>: <code>0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9</code></li>
                <li>🛠️ <strong>Compiler Version</strong>: <code>v0.8.20+commit.a1b79de6</code></li>
                <li>⚡ <strong>Gas Estimation</strong>: ~45,000 gas per escrow deposit / release</li>
              </ul>

              <h4>Key Functions:</h4>
              <div className="code-block" style={{ marginBottom: '16px' }}>
                <pre>{`function createEscrow(address _recipient) external payable returns (uint256);
function releaseOnlyIfVerified(uint256 _id) external;
function refund(uint256 _id) external;`}</pre>
              </div>

              <h4>2. OndolAuditAttestation.sol</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>📜 <strong>Contract Source</strong>: <code>contracts/OndolAuditAttestation.sol</code></li>
                <li>📍 <strong>Deployed Address</strong>: <a href="https://sepolia-explorer.giwa.io/address/0x8C89EDCA7844194813555661DC47A4A317B1D206" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>0x8C89EDCA7844194813555661DC47A4A317B1D206</a></li>
                <li>🎯 <strong>Purpose</strong>: Records verifiable AI security audit certificates directly on-chain</li>
                <li>🔍 <strong>Verification Standard</strong>: Cryptographic hash of audit report stored with grade scores (S-F)</li>
              </ul>
            </div>
          )}

          {/* DOC 4: GASOK */}
          {activeDoc === 'gasok' && (
            <div className="animate-fadeIn">
              <h2>GASOK Incubation & Acceleration Program</h2>
              <p>GASOK is a 5-month builder growth program organized by GIWA and Dunamu. It provides milestone support, mainnet staging, and mentorship.</p>
              
              <h4>Program Timeline:</h4>
              <ul>
                <li><strong>May (Phase 1)</strong>: Screening & Selection.</li>
                <li><strong>June - July (Phase 2)</strong>: MVP & Testnet Construction.</li>
                <li><strong>August - September (Phase 3)</strong>: Private mainnet staging & Seoul office support.</li>
                <li><strong>October (Phase D)</strong>: Demo Day at Korea Blockchain Week (KBW).</li>
              </ul>

              <h4>Grant Milestones:</h4>
              <p>Demo day winners receive an initial grant of <strong>$20,000 USD</strong>, with up to <strong>$80,000 USD</strong> in additional performance-based grants based on TVL and transaction volume KPIs.</p>
            </div>
          )}

          {/* DOC 5: SECURITY */}
          {activeDoc === 'security' && (
            <div className="animate-fadeIn">
              <h2>Smart Contract Security Checklist</h2>
              <p>Before deploying to mainnet, smart contracts must undergo automated AI and static analysis checkups. Ondol provides automated auditing with downloadable <code>.md</code> security reports.</p>
              
              <h4>Top Vulnerabilities Scanned:</h4>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>
                  <strong>Reentrancy Attacks</strong>
                  <p style={{ fontSize: '13px', marginTop: '2px' }}>Use OpenZeppelin's <code>nonReentrant</code> modifier or Check-Effects-Interactions pattern.</p>
                </li>
                <li>
                  <strong>Integer Underflow / Overflow</strong>
                  <p style={{ fontSize: '13px', marginTop: '2px' }}>Natively handled in Solidity 0.8.x. Use compiler version <code>^0.8.20</code>.</p>
                </li>
                <li>
                  <strong>Unchecked Call Returns</strong>
                  <p style={{ fontSize: '13px', marginTop: '2px' }}>Always verify return values of low-level <code>call()</code> or <code>transfer()</code> invocations.</p>
                </li>
              </ol>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
