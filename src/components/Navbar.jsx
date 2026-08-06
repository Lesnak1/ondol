import React from 'react';
import { Activity, Database, BrainCircuit, Settings, HelpCircle, BookOpen, Sun, Moon, Beaker, Wallet, LogOut } from 'lucide-react';

export default function Navbar({ 
  currentView, 
  onViewChange, 
  currentTheme, 
  onThemeChange, 
  onOpenSettings,
  connectedAccount,
  walletBalance,
  isConnectingWallet,
  onConnectWallet,
  onDisconnectWallet
}) {
  const truncateAddr = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="navbar">
      <div className="container nav-container">
        <div className="brand" onClick={() => onViewChange('dashboard')}>
          <div className="brand-logo-container">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 36 36" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="brand-logo-icon"
            >
              {/* Ondol heat wave layers — radiating warmth from foundation */}
              <path 
                d="M6 26C10 23 14 21 18 21C22 21 26 23 30 26" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
              <path 
                d="M8 21C12 18 15 16.5 18 16.5C21 16.5 24 18 28 21" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                opacity="0.7"
              />
              <path 
                d="M10 16C13 13.5 15.5 12.5 18 12.5C20.5 12.5 23 13.5 26 16" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                opacity="0.45"
              />
              {/* Core intelligence node */}
              <circle cx="18" cy="22" r="2.5" fill="#00F2FE" />
              <circle cx="18" cy="22" r="4" stroke="#00F2FE" strokeWidth="0.8" opacity="0.3" />
            </svg>
          </div>
          <span className="brand-name">
            Ondol
            <span className="brand-tag">GIWA</span>
          </span>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onViewChange('dashboard')}
          >
            <Activity size={15} />
            Telemetry
          </button>
          
          <button 
            className={`nav-btn ${currentView === 'explorer' ? 'active' : ''}`}
            onClick={() => onViewChange('explorer')}
          >
            <Database size={15} />
            Explorer
          </button>
          
          <button 
            className={`nav-btn nav-btn-agent ${currentView === 'agent' ? 'active' : ''}`}
            onClick={() => onViewChange('agent')}
          >
            <BrainCircuit size={15} />
            AI Agent
          </button>

          <button 
            className={`nav-btn ${currentView === 'labs' ? 'active' : ''}`}
            onClick={() => onViewChange('labs')}
          >
            <Beaker size={15} />
            Labs
          </button>

          <button 
            className={`nav-btn ${currentView === 'docs' ? 'active' : ''}`}
            onClick={() => onViewChange('docs')}
          >
            <BookOpen size={15} />
            Docs
          </button>

          <button 
            className={`nav-btn ${currentView === 'about' ? 'active' : ''}`}
            onClick={() => onViewChange('about')}
          >
            <HelpCircle size={15} />
            About
          </button>
        </nav>

        <div className="nav-controls">
          {/* Web3 Wallet Connect Button */}
          {connectedAccount ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                className="badge badge-cyan" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '5px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
                title={`Connected: ${connectedAccount}`}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00F2FE', boxShadow: '0 0 6px #00F2FE' }} />
                {truncateAddr(connectedAccount)}
                {walletBalance && <span style={{ opacity: 0.75, marginLeft: '2px' }}>({walletBalance} ETH)</span>}
              </div>
              <button 
                className="btn-icon" 
                onClick={onDisconnectWallet} 
                title="Disconnect Wallet"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-outline" 
              onClick={onConnectWallet} 
              disabled={isConnectingWallet}
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Wallet size={14} style={{ color: 'var(--color-secondary)' }} />
              {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}

          {/* Theme switcher pill toggle */}
          <div className="theme-toggle">
            <button 
              className={`theme-toggle-btn ${currentTheme === 'dark' ? 'active' : ''}`}
              onClick={() => onThemeChange('dark')}
              title="Activate Dark Mode"
            >
              <Moon size={14} />
            </button>
            <button 
              className={`theme-toggle-btn theme-toggle-btn-light ${currentTheme === 'light' ? 'active' : ''}`}
              onClick={() => onThemeChange('light')}
              title="Activate Light Mode"
            >
              <Sun size={14} />
            </button>
          </div>

          <div className="status-badge" title="GIWA Chain Sepolia JSON-RPC Status (Chain ID: 91342)">
            <span className="status-indicator"></span>
            <span>GIWA Sepolia Testnet</span>
          </div>

          <button 
            className="btn-icon" 
            onClick={onOpenSettings} 
            title="Configure AI Agent API Credentials"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
