import React, { useState } from 'react';
import { BookOpen, Server, Award, ShieldAlert, Key } from 'lucide-react';

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
            Network Settings
          </button>
          
          <button 
            className={`docs-item ${activeDoc === 'metamask' ? 'active' : ''}`}
            onClick={() => setActiveDoc('metamask')}
          >
            <Key size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Connect MetaMask
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
              <p>GIWA Chain is a high-performance EVM-compatible Layer 2 blockchain built utilizing the OP Stack framework, designed by Dunamu. This infrastructure ensures extremely low transaction latency (1s block times) and minimal gas fees while maintaining Ethereum's settlement security.</p>
              
              <h4>Custom Network Parameters:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
                <li>🌐 <strong>Network Name</strong>: GIWA Sepolia Testnet</li>
                <li>🔢 <strong>Chain ID</strong>: <code>91342</code></li>
                <li>🔌 <strong>RPC Endpoint</strong>: <code>https://sepolia-rpc.giwa.io</code></li>
                <li>🪙 <strong>Currency Symbol</strong>: <code>ETH</code> (or testnet wrapper)</li>
                <li>🔎 <strong>Block Explorer URL</strong>: <a href="https://sepolia-explorer.giwa.io" target="_blank" rel="noopener noreferrer">https://sepolia-explorer.giwa.io</a></li>
                <li>💧 <strong>Official Faucet</strong>: <a href="https://faucet.giwa.io" target="_blank" rel="noopener noreferrer">https://faucet.giwa.io</a></li>
              </ul>
            </div>
          )}

          {/* DOC 2: METAMASK */}
          {activeDoc === 'metamask' && (
            <div className="animate-fadeIn">
              <h2>Connecting MetaMask Wallet</h2>
              <p>To interact with GIWA Chain Sepolia, you need to configure your web3 provider wallet with the custom RPC parameters.</p>
              
              <h4>MetaMask Configuration Steps:</h4>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>Open your MetaMask browser extension or mobile application.</li>
                <li>Click on the <strong>Network Selection Dropdown</strong> at the top of the interface.</li>
                <li>Click <strong>Add Network</strong>, and then select <strong>Add a Network Manually</strong> at the bottom.</li>
                <li>Enter the following parameters:
                  <ul style={{ listStyle: 'circle', paddingLeft: '20px', marginTop: '6px' }}>
                    <li><strong>Network Name</strong>: GIWA Sepolia</li>
                    <li><strong>New RPC URL</strong>: <code>https://sepolia-rpc.giwa.io</code></li>
                    <li><strong>Chain ID</strong>: <code>91342</code></li>
                    <li><strong>Currency Symbol</strong>: <code>ETH</code></li>
                    <li><strong>Block Explorer URL</strong>: <code>https://sepolia-explorer.giwa.io</code></li>
                  </ul>
                </li>
                <li>Click <strong>Save</strong> and select <strong>Switch to GIWA Sepolia</strong>.</li>
              </ol>
            </div>
          )}

          {/* DOC 3: GASOK */}
          {activeDoc === 'gasok' && (
            <div className="animate-fadeIn">
              <h2>GASOK Incubation & Acceleration Program</h2>
              <p>GASOK is a comprehensive 5-month builder growth and acceleration program organized by GIWA and Dunamu. Unlike routine hackathons, GASOK is focused on deploying production-ready MVPs, onboarding users, and integrating tools directly inside the GIWA ecosystem wallet.</p>
              
              <h4>Program Timeline (2026):</h4>
              <ul>
                <li><strong>May (Phase 1)</strong>: Pitch Screening & Project Selection. Ideas are validated against GIWA's core alignment metrics.</li>
                <li><strong>June - July (Phase 2)</strong>: MVP & Testnet Build. Teams receive technical resources and private Discord server channels.</li>
                <li><strong>August - September (Phase 3)</strong>: Market Readiness & private mainnet deployments. 서울 (Seoul) office spaces and 미디어 (media) PR press releases provided.</li>
                <li><strong>October (Phase D)</strong>: Demo Day at Korea Blockchain Week (KBW). Pitch directly to leading Venture Capitals (VCs) and angel investors.</li>
              </ul>

              <h4>Financial Grants:</h4>
              <p>Demo day winners receive an initial grant of <strong>$20,000 USD</strong>. Select teams meeting monthly on-chain KPI targets (TVL growth, transaction throughput) are eligible for additional bonus grants of up to <strong>$80,000 USD</strong>, totaling <strong>$100,000 USD</strong> in support per project.</p>
            </div>
          )}

          {/* DOC 4: SECURITY */}
          {activeDoc === 'security' && (
            <div className="animate-fadeIn">
              <h2>Smart Contract Security Checklist</h2>
              <p>Before launching smart contracts on GIWA mainnet, builders are required to perform security audits. Ondol integrates an automated AI Security Auditor using advanced machine learning models to detect typical compiler warnings and bugs.</p>
              
              <h4>Top Vulnerabilities Scanned:</h4>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>
                  <strong>Reentrancy Attack</strong>
                  <p style={{ fontSize: '13px', marginTop: '2px' }}>Occurs when external contract calls are initiated before state variables are updated. Guard against this using OpenZeppelin's <code>nonReentrant</code> modifiers or Check-Effect-Interaction patterns.</p>
                </li>
                <li>
                  <strong>Integer Underflow / Overflow</strong>
                  <p style={{ fontSize: '13px', marginTop: '2px' }}>Safeguarded natively in Solidity 0.8.x, but critical for legacy compilers. Ensure compilers are set to <code>^0.8.20</code>.</p>
                </li>
                <li>
                  <strong>Unchecked Send / Call Returns</strong>
                  <p style={{ fontSize: '13px', marginTop: '2px' }}>Always verify return values of low-level <code>call()</code>, <code>send()</code>, or <code>transfer()</code> statements to catch reverted executions.</p>
                </li>
                <li>
                  <strong>Block Timestamp Manipulation</strong>
                  <p style={{ fontSize: '13px', marginTop: '2px' }}>Do not rely on <code>block.timestamp</code> or <code>block.number</code> for random number generation or exact timing, as block validators can slightly skew timestamp values.</p>
                </li>
              </ol>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
