import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import InspectorView from './components/InspectorView';
import AgentView from './components/AgentView';
import DocsView from './components/DocsView';
import AboutView from './components/AboutView';
import LabsView from './components/LabsView';
import SettingsModal from './components/SettingsModal';
import { HelpCircle, ExternalLink } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Theme state: dark (default) | light
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ondol_theme');
    return saved || 'dark';
  });

  // Apply theme class to document body on state change
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('ondol_theme', theme);
  }, [theme]);

  // Load API key from LocalStorage or fallback to environment variables
  const [apiKey, setApiKey] = useState(() => {
    const saved = localStorage.getItem('ondol_api_key');
    if (saved) return saved;
    return import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  });

  // State payloads to seed the Agent page from inspector quick-links
  const [agentTarget, setAgentTarget] = useState('');
  const [agentMode, setAgentMode] = useState(''); // 'audit' | 'explain'

  // Web3 Wallet state
  const [connectedAccount, setConnectedAccount] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  // Check if wallet was previously connected
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        if (accounts && accounts.length > 0) {
          setConnectedAccount(accounts[0]);
          fetchWalletBalance(accounts[0]);
        }
      }).catch(console.error);

      const handleAccountsChanged = (accs) => {
        if (accs.length > 0) {
          setConnectedAccount(accs[0]);
          fetchWalletBalance(accs[0]);
        } else {
          setConnectedAccount('');
          setWalletBalance('');
        }
      };

      window.ethereum.on?.('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const fetchWalletBalance = async (addr) => {
    try {
      if (!addr) return;
      // Query GIWA Sepolia RPC node directly to ensure balance is specifically from GIWA Sepolia Testnet
      const rpcRes = await fetch('https://sepolia-rpc.giwa.io', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [addr, 'latest'],
          id: 1
        })
      });

      if (rpcRes.ok) {
        const rpcJson = await rpcRes.json();
        const hex = rpcJson.result || '0x0';
        const wei = BigInt(hex);
        const ethVal = (Number(wei / BigInt(1e14)) / 10000).toFixed(4);
        setWalletBalance(ethVal);
        return;
      }

      // Fallback: Query GIWA Sepolia Explorer API
      const expRes = await fetch(`https://sepolia-explorer.giwa.io/api/v2/addresses/${addr}`);
      if (expRes.ok) {
        const expData = await expRes.json();
        if (expData.coin_balance) {
          const wei = BigInt(expData.coin_balance);
          const ethVal = (Number(wei / BigInt(1e14)) / 10000).toFixed(4);
          setWalletBalance(ethVal);
        }
      }
    } catch (err) {
      console.error('Wallet balance fetch error:', err);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('No EVM wallet found. Please install MetaMask or another EVM wallet to connect.');
      return;
    }
    setIsConnectingWallet(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setConnectedAccount(accounts[0]);
        fetchWalletBalance(accounts[0]);

        // Prompt network switch to GIWA Sepolia (Chain ID 91342 / 0x164c6)
        const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChain !== '0x164c6' && currentChain !== '91342') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x164c6' }]
            });
          } catch (switchErr) {
            if (switchErr.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x164c6',
                  chainName: 'GIWA Sepolia Testnet',
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['https://sepolia-rpc.giwa.io'],
                  blockExplorerUrls: ['https://sepolia-explorer.giwa.io']
                }]
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const disconnectWallet = () => {
    setConnectedAccount('');
    setWalletBalance('');
  };

  const handleSaveApiKey = (newKey) => {
    localStorage.setItem('ondol_api_key', newKey);
    setApiKey(newKey);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentView('explorer');
  };

  const handleBlockClick = (height) => {
    setSearchQuery(height.toString());
    setCurrentView('explorer');
  };

  const handleTxClick = (hash) => {
    setSearchQuery(hash);
    setCurrentView('explorer');
  };

  const handleAddressClick = (addr) => {
    setSearchQuery(addr);
    setCurrentView('explorer');
  };

  const handleLaunchAudit = (contractAddress) => {
    setAgentTarget(contractAddress);
    setAgentMode('audit');
    setCurrentView('agent');
  };

  const handleLaunchTxExplain = (txHash) => {
    setAgentTarget(txHash);
    setAgentMode('explain');
    setCurrentView('agent');
  };

  const handleViewChange = (view) => {
    // Reset agent payloads when switching tabs manually
    if (view !== 'agent') {
      setAgentTarget('');
      setAgentMode('');
    }
    setCurrentView(view);
  };

  return (
    <>
      {/* Background Frame Animations */}
      <div className="cyber-grid" />
      <div className="scanner-line" />

      <Navbar 
        currentView={currentView} 
        onViewChange={handleViewChange} 
        currentTheme={theme}
        onThemeChange={setTheme}
        onOpenSettings={() => setIsSettingsOpen(true)} 
        connectedAccount={connectedAccount}
        walletBalance={walletBalance}
        isConnectingWallet={isConnectingWallet}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
      />

      <main className="main-content">
        {currentView === 'dashboard' && (
          <DashboardView 
            onSearch={handleSearch}
            onBlockClick={handleBlockClick}
            onTxClick={handleTxClick}
            onAddressClick={handleAddressClick}
          />
        )}
        
        {currentView === 'explorer' && (
          <InspectorView 
            initialSearchQuery={searchQuery}
            onLaunchAudit={handleLaunchAudit}
            onLaunchTxExplain={handleLaunchTxExplain}
            onSearchRedirect={setSearchQuery}
          />
        )}
        
        {currentView === 'agent' && (
          <AgentView 
            apiKey={apiKey}
            onOpenSettings={() => setIsSettingsOpen(true)}
            initialTarget={agentTarget}
            initialMode={agentMode}
          />
        )}

        {currentView === 'labs' && <LabsView />}

        {currentView === 'docs' && <DocsView />}

        {currentView === 'about' && <AboutView />}
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <p style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>GIWA Sepolia Specs: Chain ID: <strong>91342</strong></span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>RPC: <strong style={{ color: 'var(--color-primary)' }}>https://sepolia-rpc.giwa.io</strong></span>
            <span style={{ opacity: 0.3 }}>|</span>
            <a href="https://faucet.giwa.io" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Claim Faucet <ExternalLink size={11} />
            </a>
            <span style={{ opacity: 0.3 }}>|</span>
            <a href="https://docs.giwa.io" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Documentation <ExternalLink size={11} />
            </a>
          </p>
          <p style={{ fontSize: '12px', marginTop: '6px', color: 'var(--color-text-muted)' }}>
            Built by <a href="https://github.com/Lesnak1" target="_blank" rel="noopener noreferrer" className="leknax-badge">Leknax</a>
          </p>
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={localStorage.getItem('ondol_api_key') || ''} 
        onSave={handleSaveApiKey} 
        hasEnvKey={!!import.meta.env.VITE_DEEPSEEK_API_KEY}
      />
    </>
  );
}

export default App;
