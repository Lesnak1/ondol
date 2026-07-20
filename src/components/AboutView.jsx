import React from 'react';
import { HelpCircle, Target, Award, Cpu, ShieldCheck, Zap } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="container animate-fadeIn">
      
      {/* Hero Intro */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="badge badge-red" style={{ marginBottom: '12px' }}>Ecosystem Mission</span>
        <h1 style={{ fontSize: '36px', marginBottom: '12px', fontWeight: 800 }}>About Ondol</h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', fontSize: '15px' }}>
          An advanced blockchain intelligence platform, contract security auditor, and visual forensic suite built native for the GIWA Chain ecosystem.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Core Vision */}
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '22px', color: '#FFF', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Target style={{ color: 'var(--color-primary)' }} /> Our Vision
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
              GIWA Chain, engineered with the OP Stack by <strong>Dunamu</strong>, is designed to serve as the global infrastructure for Web3 access, particularly bridging mainstream audiences in South Korea and globally.
            </p>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <strong>Ondol</strong> was built to elevate this infrastructure. By translating raw hex ledger logs into visually engaging diagrams, area telemetry curves, and interactive solidity compilers, we lower the barrier of entry for developers, compliance auditors, and users.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--color-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>Ecosystem Synergy</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Zap size={14} style={{ color: 'var(--color-primary)', marginTop: '2px', shrink: 0 }} />
                <span><strong>OP Stack Telemetry</strong>: Visualizes block throughput and base fee adjustments dynamically.</span>
              </li>
              <li style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <ShieldCheck size={14} style={{ color: 'var(--color-success)', marginTop: '2px', shrink: 0 }} />
                <span><strong>AI Safety Checks</strong>: Audits code lines instantly to prevent systemic smart contract risks.</span>
              </li>
              <li style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Cpu size={14} style={{ color: 'var(--color-secondary)', marginTop: '2px', shrink: 0 }} />
                <span><strong>White-Label AI Co-pilot</strong>: Implements secure sandbox key storage for white-label developer assistants.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* GASOK tracks alignment */}
        <div className="glass-card">
          <h3 style={{ fontSize: '20px', color: '#FFF', marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Award style={{ color: 'var(--color-secondary)' }} /> GASOK Program Tracks
          </h3>
          <p style={{ fontSize: '13px', marginBottom: '24px' }}>How Ondol implements the active tracks of the GIWA Builder Acceleration Program:</p>
          
          <div className="about-features">
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
              <h4 style={{ color: 'var(--color-secondary)', fontSize: '15px', marginBottom: '8px' }}>DeFi & RWA Security</h4>
              <p style={{ fontSize: '12.5px', lineHeight: '1.5' }}>
                Our <strong>AI Auditor</strong> scans financial contracts, liquidity pools, and tokens to verify mathematical correctness, guarding against reentrancy risks and oracle manipulation.
              </p>
            </div>
            
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
              <h4 style={{ color: 'var(--color-primary)', fontSize: '15px', marginBottom: '8px' }}>AI & Web3 Integration</h4>
              <p style={{ fontSize: '12.5px', lineHeight: '1.5' }}>
                Combines EVM chain execution states with advanced neural text models to decode raw logs, profile transaction call trees, and serve developer assistance.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
              <h4 style={{ color: 'var(--color-secondary)', fontSize: '15px', marginBottom: '8px' }}>Ecosystem Adoption</h4>
              <p style={{ fontSize: '12.5px', lineHeight: '1.5' }}>
                Provides direct guides to faucet claiming, RPC setup parameters (Chain ID 91342), and metadata explorer indexes to foster a fast, developer-friendly sandbox.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
