import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowRight, ArrowRightLeft, Layers, Hash, Coins, FileCode, 
  ExternalLink, User, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, 
  Copy, Check, Bot, Code, HelpCircle, RefreshCw 
} from 'lucide-react';

export default function InspectorView({ initialSearchQuery, onLaunchAudit, onLaunchTxExplain, onSearchRedirect }) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [currentQuery, setCurrentQuery] = useState(initialSearchQuery || '');
  const [resolvedType, setResolvedType] = useState(null); // 'address' | 'tx' | 'block' | 'invalid'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [blockData, setBlockData] = useState(null);
  const [txData, setTxData] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [addressTxs, setAddressTxs] = useState([]);
  const [addressTokens, setAddressTokens] = useState([]);
  const [contractData, setContractData] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Address sub-tabs state
  const [activeAddressTab, setActiveAddressTab] = useState('transactions'); // 'transactions' | 'tokens' | 'contract'
  
  // Copy feedback state
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    if (resolvedType === 'address' && addressData) {
      const saved = localStorage.getItem('ondol_watchlist');
      if (saved) {
        const list = JSON.parse(saved);
        setIsBookmarked(list.includes(addressData.hash));
      } else {
        setIsBookmarked(false);
      }
    }
  }, [addressData, resolvedType]);

  const toggleBookmark = () => {
    if (!addressData) return;
    const saved = localStorage.getItem('ondol_watchlist');
    let list = saved ? JSON.parse(saved) : [];
    if (list.includes(addressData.hash)) {
      list = list.filter(a => a !== addressData.hash);
      setIsBookmarked(false);
    } else {
      list.push(addressData.hash);
      setIsBookmarked(true);
    }
    localStorage.setItem('ondol_watchlist', JSON.stringify(list));
  };

  const triggerCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const resolveQueryType = (query) => {
    if (!query) return null;
    const clean = query.trim();
    if (clean.length === 66 && clean.startsWith('0x')) {
      return 'tx';
    } else if (clean.length === 42 && clean.startsWith('0x')) {
      return 'address';
    } else if (/^\d+$/.test(clean)) {
      return 'block';
    }
    return 'invalid';
  };

  const executeSearch = async (queryToSearch) => {
    if (!queryToSearch) return;
    setLoading(true);
    setError(null);
    setBlockData(null);
    setTxData(null);
    setAddressData(null);
    setAddressTxs([]);
    setAddressTokens([]);
    setContractData(null);

    const type = resolveQueryType(queryToSearch);
    setResolvedType(type);
    setCurrentQuery(queryToSearch);

    try {
      if (type === 'block') {
        const res = await fetch(`https://sepolia-explorer.giwa.io/api/v2/blocks/${queryToSearch}`);
        if (!res.ok) throw new Error(`Block #${queryToSearch} not found`);
        const data = await res.json();
        setBlockData(data);
      } else if (type === 'tx') {
        const res = await fetch(`https://sepolia-explorer.giwa.io/api/v2/transactions/${queryToSearch}`);
        if (!res.ok) throw new Error(`Transaction ${queryToSearch} not found`);
        const data = await res.json();
        setTxData(data);
      } else if (type === 'address') {
        // Fetch Address base details
        const resAddr = await fetch(`https://sepolia-explorer.giwa.io/api/v2/addresses/${queryToSearch}`);
        if (!resAddr.ok) throw new Error(`Address ${queryToSearch} not found`);
        const addrData = await resAddr.json();
        setAddressData(addrData);

        // Fetch Address transactions
        const resTxs = await fetch(`https://sepolia-explorer.giwa.io/api/v2/addresses/${queryToSearch}/transactions`);
        if (resTxs.ok) {
          const txsData = await resTxs.json();
          setAddressTxs(txsData.items || []);
        }

        // Fetch Address token balances
        const resTokens = await fetch(`https://sepolia-explorer.giwa.io/api/v2/addresses/${queryToSearch}/tokens`);
        if (resTokens.ok) {
          const tokensData = await resTokens.json();
          setAddressTokens(tokensData || []);
        }

        // If address is contract, fetch verified contract code (optional details)
        if (addrData.is_contract) {
          const resContract = await fetch(`https://sepolia-explorer.giwa.io/api/v2/smart-contracts/${queryToSearch}`);
          if (resContract.ok) {
            const cData = await resContract.json();
            setContractData(cData);
            setActiveAddressTab('contract'); // Default to contract view for contract address
          } else {
            setActiveAddressTab('transactions');
          }
        } else {
          setActiveAddressTab('transactions');
        }
      } else {
        throw new Error('Unsupported search format. Search by block number, tx hash, or address.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading inspector data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      executeSearch(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      executeSearch(searchQuery.trim());
      if (onSearchRedirect) onSearchRedirect(searchQuery.trim());
    }
  };

  const truncateHash = (hash, size = 8) => {
    if (!hash) return '';
    return `${hash.slice(0, size)}...${hash.slice(-size)}`;
  };

  const formatGwei = (weiValue) => {
    if (!weiValue) return '0';
    return (parseFloat(weiValue) / 1e9).toFixed(5);
  };

  const formatEther = (weiValue) => {
    if (!weiValue) return '0';
    return (parseFloat(weiValue) / 1e18).toFixed(6);
  };

  return (
    <div className="container animate-fadeIn">
      {/* Top Search bar */}
      <div style={{ marginBottom: '32px' }}>
        <form onSubmit={handleSearchSubmit} className="search-container" style={{ margin: '0' }}>
          <div className="glass-card search-card">
            <Search className="input-icon" style={{ position: 'relative', left: '12px' }} size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search address, transaction hash, or block number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Inspect <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '16px' }}>
          <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--color-secondary)' }} />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-muted)' }}>Querying Sepolia node...</p>
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-error)', display: 'flex', gap: '16px', alignItems: 'center', padding: '20px' }}>
          <XCircle size={32} style={{ color: 'var(--color-error)' }} />
          <div>
            <h3 style={{ fontSize: '16px', color: '#FFF' }}>Inspector Search Failed</h3>
            <p style={{ fontSize: '13px' }}>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && !resolvedType && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
          <HelpCircle size={48} style={{ color: 'var(--color-text-dark)', marginBottom: '16px', margin: '0 auto' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Enter an On-chain Target</h3>
          <p style={{ maxWidth: '450px', margin: '0 auto', fontSize: '14px' }}>
            Input a wallet address, smart contract address, block height, or transaction hash in the search bar above to inspect live ledger details.
          </p>
        </div>
      )}

      {/* BLOCK DETAILS VIEW */}
      {!loading && !error && resolvedType === 'block' && blockData && (
        <div className="glass-card animate-slideUp" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <span className="badge badge-red" style={{ marginBottom: '8px' }}>Block Profile</span>
              <h2 style={{ fontSize: '28px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Layers style={{ color: 'var(--color-primary)' }} />
                Block #{blockData.height}
              </h2>
            </div>
            <a 
              href={`https://sepolia-explorer.giwa.io/block/${blockData.height}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline" 
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Explorer <ExternalLink size={12} />
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }} className="custom-table">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, width: '140px' }}>Block Hash</td>
                    <td className="mono-text" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {truncateHash(blockData.hash, 12)}
                      <button className="btn-icon" onClick={() => triggerCopy(blockData.hash)}>
                        {copiedText === blockData.hash ? <Check size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Timestamp</td>
                    <td>{new Date(blockData.timestamp).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Transactions</td>
                    <td className="mono-text" style={{ fontWeight: 700 }}>{blockData.transactions_count} contract calls / transfers</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }} className="custom-table">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, width: '140px' }}>Miner (Validator)</td>
                    <td className="mono-text" style={{ color: 'var(--color-secondary)', fontSize: '12px' }}>
                      {blockData.miner?.hash}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Gas Limit / Gas Used</td>
                    <td className="mono-text" style={{ fontSize: '12px' }}>
                      {parseInt(blockData.gas_limit).toLocaleString()} / {parseInt(blockData.gas_used).toLocaleString()} ({((parseInt(blockData.gas_used)/parseInt(blockData.gas_limit))*100).toFixed(2)}%)
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Parent Hash</td>
                    <td className="mono-text" style={{ fontSize: '12px', color: 'var(--color-text-dark)' }}>
                      {truncateHash(blockData.parent_hash, 12)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION DETAILS VIEW */}
      {!loading && !error && resolvedType === 'tx' && txData && (
        <div className="glass-card animate-slideUp" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>Transaction Profile</span>
              <h2 style={{ fontSize: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Hash style={{ color: 'var(--color-secondary)' }} />
                TX: {truncateHash(txData.hash, 16)}
              </h2>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => onLaunchTxExplain(txData.hash)}
                className="btn btn-secondary animate-fadeIn" 
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                <Bot size={14} /> Explain TX
              </button>
              
              <a 
                href={`https://sepolia-explorer.giwa.io/tx/${txData.hash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline" 
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Explorer <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div>
              <table style={{ width: '100%' }} className="custom-table">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, width: '140px' }}>Status</td>
                    <td>
                      {txData.status === 'ok' ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Success
                        </span>
                      ) : (
                        <span className="badge badge-error">
                          <XCircle size={12} /> Reverted
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Block Number</td>
                    <td className="mono-text" style={{ color: 'var(--color-secondary)' }}>
                      #{txData.block_number}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Timestamp</td>
                    <td>{new Date(txData.timestamp).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>From Address</td>
                    <td className="mono-text" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {txData.from?.hash}
                      <button className="btn-icon" onClick={() => triggerCopy(txData.from?.hash)}>
                        {copiedText === txData.from?.hash ? <Check size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>To Address</td>
                    <td className="mono-text" style={{ fontSize: '12px' }}>
                      {txData.to ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {txData.to?.hash}
                          <button className="btn-icon" onClick={() => triggerCopy(txData.to?.hash)}>
                            {copiedText === txData.to?.hash ? <Check size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
                          </button>
                        </span>
                      ) : txData.created_contract ? (
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          [Contract Creation] {txData.created_contract?.hash}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-dark)' }}>N/A</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <table style={{ width: '100%' }} className="custom-table">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, width: '140px' }}>Value Transferred</td>
                    <td className="mono-text" style={{ fontWeight: 700 }}>
                      {formatEther(txData.value)} ETH
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Transaction Fee</td>
                    <td className="mono-text" style={{ color: 'var(--color-primary)' }}>
                      {formatEther(txData.fee?.value)} ETH (${formatGwei(txData.fee?.value)} Gwei)
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Gas Limit / Gas Used</td>
                    <td className="mono-text" style={{ fontSize: '12px' }}>
                      {parseInt(txData.gas_limit).toLocaleString()} / {parseInt(txData.gas_used).toLocaleString()} ({((parseInt(txData.gas_used)/parseInt(txData.gas_limit))*100).toFixed(1)}%)
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Method Call</td>
                    <td>
                      <span className="badge badge-purple" style={{ textTransform: 'uppercase' }}>
                        {txData.decoded_input?.method_call || txData.method || 'transfer'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Calldata output */}
          {txData.raw_input && txData.raw_input !== '0x' && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Decoded Input Arguments (Calldata)</h4>
              <div className="code-block" style={{ maxHeight: '180px' }}>
                <pre>{txData.decoded_input ? JSON.stringify(txData.decoded_input.parameters, null, 2) : txData.raw_input}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADDRESS / SMART CONTRACT DETAILS VIEW */}
      {!loading && !error && resolvedType === 'address' && addressData && (
        <div className="glass-card animate-slideUp" style={{ padding: '32px' }}>
          
          {/* Account Profile Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <span className={`badge ${addressData.is_contract ? 'badge-purple' : 'badge-cyan'}`} style={{ marginBottom: '8px' }}>
                {addressData.is_contract ? 'Smart Contract Account' : 'External Wallet Account'}
              </span>
              <h2 style={{ fontSize: '24px', display: 'flex', gap: '10px', alignItems: 'center', fontFamily: 'var(--font-mono)' }}>
                {addressData.is_contract ? <FileCode style={{ color: '#B388FF' }} /> : <User style={{ color: 'var(--color-secondary)' }} />}
                {truncateHash(addressData.hash, 12)}
                <button className="btn-icon" onClick={() => triggerCopy(addressData.hash)} title="Copy Address">
                  {copiedText === addressData.hash ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                </button>
                <button 
                  className="btn-icon" 
                  onClick={toggleBookmark} 
                  style={{ color: isBookmarked ? 'var(--color-warning)' : 'var(--color-text-dark)' }}
                  title={isBookmarked ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                  <span style={{ fontSize: '18px', display: 'inline-block', transform: 'translateY(-1px)' }}>{isBookmarked ? '★' : '☆'}</span>
                </button>
              </h2>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {addressData.is_contract && (
                <button 
                  onClick={() => onLaunchAudit(addressData.hash)}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                >
                  <Bot size={14} /> Audit Contract
                </button>
              )}
              
              <a 
                href={`https://sepolia-explorer.giwa.io/address/${addressData.hash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline" 
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Explorer <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Balance Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
              <p className="input-label" style={{ fontSize: '9px' }}>ETH Balance</p>
              <h3 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {formatEther(addressData.coin_balance)} ETH
              </h3>
            </div>
            
            {addressData.is_contract && (
              <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
                <p className="input-label" style={{ fontSize: '9px' }}>Contract Status</p>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                  {contractData ? (
                    <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} /> Verified Source
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={16} /> Unverified Code
                    </span>
                  )}
                </h3>
              </div>
            )}

            <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
              <p className="input-label" style={{ fontSize: '9px' }}>Activity Status</p>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {addressTxs.length > 0 ? 'Active Wallet' : 'Inactive / Empty'}
              </h3>
            </div>
          </div>

          {/* Sub-tab navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <button 
              className={`nav-btn ${activeAddressTab === 'transactions' ? 'active' : ''}`}
              style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
              onClick={() => setActiveAddressTab('transactions')}
            >
              Transactions ({addressTxs.length})
            </button>
            <button 
              className={`nav-btn ${activeAddressTab === 'tokens' ? 'active' : ''}`}
              style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
              onClick={() => setActiveAddressTab('tokens')}
            >
              Token Balances ({addressTokens.length})
            </button>
            {addressData.is_contract && (
              <button 
                className={`nav-btn ${activeAddressTab === 'contract' ? 'active' : ''}`}
                style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
                onClick={() => setActiveAddressTab('contract')}
              >
                Contract Source
              </button>
            )}
          </div>

          {/* TAB CONTENTS: TRANSACTIONS LIST */}
          {activeAddressTab === 'transactions' && (
            <div>
              {addressTxs.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '24px' }}>No transactions recorded for this address.</p>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Hash</th>
                        <th>Block</th>
                        <th>Age</th>
                        <th>Method</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addressTxs.slice(0, 10).map((tx) => (
                        <tr key={tx.hash}>
                          <td className="mono-text">
                            <span 
                              style={{ color: 'var(--color-primary)', cursor: 'pointer' }}
                              onClick={() => executeSearch(tx.hash)}
                            >
                              {truncateHash(tx.hash)}
                            </span>
                          </td>
                          <td className="mono-text">#{tx.block_number}</td>
                          <td style={{ fontSize: '12px' }}>{new Date(tx.timestamp).toLocaleString()}</td>
                          <td>
                            <span className="badge badge-purple" style={{ fontSize: '10px' }}>
                              {tx.method || (tx.to?.hash === addressData.hash ? 'receive' : 'transfer')}
                            </span>
                          </td>
                          <td className="mono-text">{formatEther(tx.value)} ETH</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENTS: TOKEN BALANCES */}
          {activeAddressTab === 'tokens' && (
            <div>
              {addressTokens.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '24px' }}>No ERC20/ERC721 token balances detected.</p>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Token Name</th>
                        <th>Symbol</th>
                        <th>Balance</th>
                        <th>Contract</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addressTokens.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{item.token?.name || 'Unknown'}</td>
                          <td className="mono-text">{item.token?.symbol}</td>
                          <td className="mono-text" style={{ fontWeight: 700 }}>
                            {(parseFloat(item.value) / Math.pow(10, parseInt(item.token?.decimals || 18))).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                          </td>
                          <td className="mono-text" style={{ fontSize: '12px', color: 'var(--color-text-dark)' }}>
                            {truncateHash(item.token?.address, 10)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENTS: CONTRACT DETAILS */}
          {activeAddressTab === 'contract' && (
            <div>
              {contractData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Metadata info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <p className="input-label" style={{ fontSize: '8px' }}>Contract Name</p>
                      <h4 className="mono-text" style={{ color: 'var(--color-secondary)' }}>{contractData.name || 'VerifiedContract'}</h4>
                    </div>
                    <div>
                      <p className="input-label" style={{ fontSize: '8px' }}>Compiler Version</p>
                      <h4 className="mono-text">{contractData.compiler_version}</h4>
                    </div>
                    <div>
                      <p className="input-label" style={{ fontSize: '8px' }}>Optimization</p>
                      <h4 className="mono-text">{contractData.optimization_enabled ? 'Enabled' : 'Disabled'}</h4>
                    </div>
                  </div>

                  {/* ABI read/write table */}
                  {contractData.abi && (
                    <div>
                      <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Smart Contract ABI Methods</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                        {contractData.abi
                          .filter(x => x.type === 'function')
                          .map((method, idx) => (
                            <span 
                              key={idx} 
                              className={`badge ${method.stateMutability === 'view' || method.stateMutability === 'pure' ? 'badge-cyan' : 'badge-red'}`}
                              style={{ padding: '6px 12px', fontSize: '11px' }}
                              title={`${method.name}(${method.inputs.map(i => i.type).join(', ')})`}
                            >
                              {method.name}()
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Source files list */}
                  {contractData.source_code && (
                    <div>
                      <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source Code Files</h3>
                      <div className="code-block" style={{ maxHeight: '480px' }}>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>
                          {contractData.source_code}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <AlertTriangle size={32} style={{ color: 'var(--color-warning)', marginBottom: '12px', margin: '0 auto' }} />
                  <p style={{ fontWeight: 600, color: 'var(--color-warning)' }}>Contract Source Code Unverified</p>
                  <p style={{ fontSize: '13px', maxWidth: '400px', margin: '8px auto 0 auto' }}>
                    This contract has not been verified on GIWA Sepolia. Bytecode is available but compiler settings and solidity scripts are unavailable for reading.
                  </p>
                  <div className="code-block" style={{ marginTop: '20px', maxHeight: '180px' }}>
                    <pre>{addressData.deployed_bytecode || 'No deployed bytecode found.'}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
