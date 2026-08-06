import React from 'react';
import { Target, Award, Cpu, ShieldCheck, Zap, Wallet, FileCode, Activity, CheckCircle2 } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '../config/contracts';

export default function AboutView() {
  return (
    <div className="container animate-fadeIn">
      
      {/* Hero Intro */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="badge badge-red" style={{ marginBottom: '12px' }}>Ecosystem Mission</span>
        <h1 style={{ fontSize: '36px', marginBottom: '12px', fontWeight: 800 }}>About Ondol (온돌)</h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', fontSize: '15px' }}>
          An advanced blockchain intelligence platform, contract security auditor, and compliance gateway built natively for the GIWA Chain ecosystem.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Architectural Metaphor & Core Vision */}
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '22px', color: '#FFF', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Target style={{ color: 'var(--color-primary)' }} /> Architectural Vision
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
              GIWA Chain, engineered with the OP Stack by <strong>Dunamu</strong>, is designed as the global Web3 infrastructure for mainstream users and institutions in South Korea and globally.
            </p>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              While <strong>GIWA (기와)</strong> roof tiles represent the upper protection layer, <strong>Ondol (온돌)</strong> represents the vital underfloor heating foundation. Our platform translates raw hex ledger logs into visual telemetry curves, interactive Solidity compilers, and compliance gateways.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--color-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>Core Platform Subsystems</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
              <li style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Activity size={16} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Catmull-Rom Spline Engine</strong>: Visualizes transaction throughput and gas consumption curves with sub-second precision.</span>
              </li>
              <li style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <ShieldCheck size={16} style={{ color: 'var(--color-success)', marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Dojang Identity Verifier</strong>: Reads official attestations from the <code>DojangScroll</code> contract (<code>0xd5077b67...17B9</code>).</span>
              </li>
              <li style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Cpu size={16} style={{ color: 'var(--color-secondary)', marginTop: '2px', flexShrink: 0 }} />
                <span><strong>AI Auditor & Report Export</strong>: Scans Solidity scripts for vulnerabilities and exports downloadable <code>.md</code> security reports.</span>
              </li>
              <li style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Wallet size={16} style={{ color: '#B388FF', marginTop: '2px', flexShrink: 0 }} />
                <span><strong>1-Click Web3 Connect</strong>: Native EIP-1193 wallet integration with automatic GIWA Sepolia network switching (Chain ID 91342).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Live On-Chain Deployed Smart Contracts */}
        <div className="glass-card" style={{ background: 'rgba(0, 242, 254, 0.02)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
          <h3 style={{ fontSize: '20px', color: '#FFF', marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <FileCode style={{ color: 'var(--color-secondary)' }} /> Deployed Smart Contracts on GIWA Sepolia
          </h3>
          <p style={{ fontSize: '13px', marginBottom: '20px' }}>
            Ondol deploys native smart contracts compiled with <code>solc ^0.8.20</code> directly on the GIWA Sepolia Testnet (Chain ID 91342):
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                <h4 style={{ color: '#FFF', fontSize: '14px' }}>OndolDojangEscrow.sol</h4>
              </div>
              <p style={{ fontSize: '12px', marginBottom: '8px' }}>Identity-Gated Escrow contract calling <code>DojangScroll.isVerified()</code>.</p>
              <a 
                href={`https://sepolia-explorer.giwa.io/address/${CONTRACT_ADDRESSES.ONDOL_DOJANG_ESCROW}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mono-text"
                style={{ fontSize: '11px', color: 'var(--color-secondary)', wordBreak: 'break-all' }}
              >
                {CONTRACT_ADDRESSES.ONDOL_DOJANG_ESCROW}
              </a>
            </div>

            <div className="glass-card" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                <h4 style={{ color: '#FFF', fontSize: '14px' }}>OndolAuditAttestation.sol</h4>
              </div>
              <p style={{ fontSize: '12px', marginBottom: '8px' }}>On-Chain Security Audit Certificate registry for verifiable AI reports.</p>
              <a 
                href={`https://sepolia-explorer.giwa.io/address/${CONTRACT_ADDRESSES.ONDOL_AUDIT_ATTESTATION}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mono-text"
                style={{ fontSize: '11px', color: 'var(--color-secondary)', wordBreak: 'break-all' }}
              >
                {CONTRACT_ADDRESSES.ONDOL_AUDIT_ATTESTATION}
              </a>
            </div>
          </div>
        </div>

        {/* GASOK tracks alignment */}
        <div className="glass-card">
          <h3 style={{ fontSize: '20px', color: '#FFF', marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Award style={{ color: 'var(--color-secondary)' }} /> GASOK Incubation Track Alignment
          </h3>
          <p style={{ fontSize: '13px', marginBottom: '24px' }}>How Ondol directly addresses the core tracks of the GIWA Builder Acceleration Program:</p>
          
          <div className="about-features">
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
              <h4 style={{ color: 'var(--color-primary)', fontSize: '15px', marginBottom: '8px' }}>Track 04: AI & Web3</h4>
              <p style={{ fontSize: '12.5px', lineHeight: '1.5' }}>
                Integrates advanced AI completion models with real-time L2 indexers to audit Solidity scripts, decode complex calldata, and export verifiable security certificates.
              </p>
            </div>
            
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
              <h4 style={{ color: 'var(--color-secondary)', fontSize: '15px', marginBottom: '8px' }}>Track 03: GIWA-Native</h4>
              <p style={{ fontSize: '12.5px', lineHeight: '1.5' }}>
                Couples Dunamu's Dojang identity verification protocol with automated payment escrows, establishing a compliant payment gateway for Web3 dApps.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
              <h4 style={{ color: 'var(--color-success)', fontSize: '15px', marginBottom: '8px' }}>Mass Adoption & Tooling</h4>
              <p style={{ fontSize: '12.5px', lineHeight: '1.5' }}>
                Reduces context switching for developers with integrated RPC latency monitors, live whale transaction streams, and browser-persistent watchlists.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
