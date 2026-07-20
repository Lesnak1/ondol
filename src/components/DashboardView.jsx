import React, { useState, useEffect } from 'react';
import { 
  Server, ArrowRightLeft, Layers, Hash, Coins, Cpu, TrendingUp, Search, 
  ArrowRight, RefreshCw, AlertTriangle, ExternalLink 
} from 'lucide-react';

export default function DashboardView({ onSearch, onBlockClick, onTxClick, onAddressClick }) {
  const [stats, setStats] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      // 1. Fetch network stats
      const statsRes = await fetch('https://sepolia-explorer.giwa.io/api/v2/stats');
      if (!statsRes.ok) throw new Error('Failed to fetch chain stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch recent blocks
      const blocksRes = await fetch('https://sepolia-explorer.giwa.io/api/v2/blocks');
      if (!blocksRes.ok) throw new Error('Failed to fetch blocks');
      const blocksData = await blocksRes.json();
      setBlocks(blocksData.items || []);

      // 3. Fetch recent transactions
      const txsRes = await fetch('https://sepolia-explorer.giwa.io/api/v2/transactions');
      if (!txsRes.ok) throw new Error('Failed to fetch transactions');
      const txsData = await txsRes.json();
      setTxs(txsData.items || []);

      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching network telemetry.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 12 seconds for block and tx updates to prevent API rate limiting
    const interval = setInterval(() => fetchData(true), 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('ondol_watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, [blocks]); // Refresh whenever data polls

  const removeBookmark = (addr) => {
    const updated = watchlist.filter(a => a !== addr);
    setWatchlist(updated);
    localStorage.setItem('ondol_watchlist', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal.trim());
    }
  };

  // Catmull-Rom spline to SVG cubic bezier — produces buttery smooth curves
  const catmullRom2Bezier = (pts, tension = 0.35) => {
    if (pts.length < 2) return '';
    const segments = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      segments.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
    }
    return `M ${pts[0].x},${pts[0].y} ${segments.join(' ')}`;
  };

  // Render premium SVG area chart
  const renderTxChart = () => {
    if (blocks.length === 0) return null;

    const chartBlocks = [...blocks.slice(0, 10)].reverse();
    const dataPoints = chartBlocks.map(b => b.transactions_count || 0);
    const gasPoints = chartBlocks.map(b => parseInt(b.gas_used) || 0);
    const maxVal = Math.max(...dataPoints, 6);
    const maxGas = Math.max(...gasPoints, 1);
    const avgTx = Math.round(dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length);
    const peakTx = Math.max(...dataPoints);

    const W = 780;
    const H = 145;
    const PL = 40;   // padding left
    const PR = 14;   // padding right
    const PT = 12;   // padding top
    const PB = 26;   // padding bottom
    const cW = W - PL - PR;
    const cH = H - PT - PB;

    const txPts = dataPoints.map((v, i) => ({
      x: PL + (i / (dataPoints.length - 1)) * cW,
      y: PT + cH - (v / maxVal) * cH,
      val: v,
    }));

    const gasPts = gasPoints.map((v, i) => ({
      x: PL + (i / (gasPoints.length - 1)) * cW,
      y: PT + cH - (v / maxGas) * cH * 0.6, // scale gas to 60% of chart height
    }));

    const txCurve = catmullRom2Bezier(txPts);
    const gasCurve = catmullRom2Bezier(gasPts);

    const txArea = txCurve
      ? `${txCurve} L ${txPts[txPts.length - 1].x},${H - PB} L ${txPts[0].x},${H - PB} Z`
      : '';
    const gasArea = gasCurve
      ? `${gasCurve} L ${gasPts[gasPts.length - 1].x},${H - PB} L ${gasPts[0].x},${H - PB} Z`
      : '';

    // Y-axis nice ticks
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(r => ({
      y: PT + cH - r * cH,
      label: Math.round(r * maxVal),
    }));

    return (
      <div
        style={{ position: 'relative', width: '100%', userSelect: 'none' }}
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: 'visible', display: 'block' }}
        >
          <defs>
            {/* Primary TX gradient — vertical fade */}
            <linearGradient id="txAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3E4D" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#FF3E4D" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#FF3E4D" stopOpacity="0" />
            </linearGradient>

            {/* Secondary gas gradient */}
            <linearGradient id="gasAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#00F2FE" stopOpacity="0" />
            </linearGradient>

            {/* Line glow */}
            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Dot outer glow */}
            <filter id="dotGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Hover crosshair gradient */}
            <linearGradient id="crosshairGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3E4D" stopOpacity="0" />
              <stop offset="50%" stopColor="#FF3E4D" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FF3E4D" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis gridlines */}
          {yTicks.map((t, i) => (
            <g key={`ytick-${i}`}>
              <line
                x1={PL}
                y1={t.y}
                x2={W - PR}
                y2={t.y}
                stroke="var(--border-color)"
                strokeWidth="0.8"
                strokeDasharray={i === 0 ? '0' : '3,6'}
                opacity={i === 0 ? '0.6' : '0.35'}
              />
              <text
                x={PL - 8}
                y={t.y + 3.5}
                fill="var(--color-text-dark)"
                fontSize="8.5"
                fontFamily="var(--font-mono)"
                textAnchor="end"
                fontWeight="500"
              >
                {t.label}
              </text>
            </g>
          ))}

          {/* Gas sparkline area (background layer) */}
          {gasArea && (
            <path d={gasArea} fill="url(#gasAreaGrad)" />
          )}
          {gasCurve && (
            <path
              d={gasCurve}
              fill="none"
              stroke="#00F2FE"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.25"
              strokeDasharray="4,4"
            />
          )}

          {/* TX area fill */}
          {txArea && <path d={txArea} fill="url(#txAreaGrad)" />}

          {/* TX curve line */}
          {txCurve && (
            <path
              d={txCurve}
              fill="none"
              stroke="#FF3E4D"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
            />
          )}

          {/* Hover crosshair */}
          {hoveredPoint && (
            <>
              <line
                x1={hoveredPoint.x}
                y1={PT}
                x2={hoveredPoint.x}
                y2={H - PB}
                stroke="url(#crosshairGrad)"
                strokeWidth="1.5"
              />
              {/* Horizontal from dot */}
              <line
                x1={PL}
                y1={hoveredPoint.y}
                x2={W - PR}
                y2={hoveredPoint.y}
                stroke="#FF3E4D"
                strokeWidth="0.6"
                strokeDasharray="2,4"
                opacity="0.35"
              />
            </>
          )}

          {/* Data dots */}
          {txPts.map((p, i) => {
            const active = hoveredPoint?.index === i;
            return (
              <g key={`dot-${i}`}>
                {/* Outer pulse ring */}
                {active && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="10"
                    fill="none"
                    stroke="#FF3E4D"
                    strokeWidth="1.5"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="r"
                      values="5;12;5"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.5;0;0.5"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Glow halo */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? '6' : '4'}
                  fill="#FF3E4D"
                  opacity={active ? '0.25' : '0.12'}
                  filter="url(#dotGlow)"
                />
                {/* Core dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? '4' : '2.5'}
                  fill={active ? '#FF3E4D' : '#FFF'}
                  stroke="#FF3E4D"
                  strokeWidth={active ? '2' : '1.5'}
                />
                {/* X-axis block label */}
                <text
                  x={p.x}
                  y={H - PB + 14}
                  fill={active ? 'var(--color-text-main)' : 'var(--color-text-dark)'}
                  fontSize="8"
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                  fontWeight={active ? '700' : '400'}
                >
                  #{chartBlocks[i].height.toString().slice(-5)}
                </text>
              </g>
            );
          })}

          {/* Invisible hover zones */}
          {txPts.map((p, i) => {
            const step = cW / (txPts.length - 1);
            const hw = i === 0 || i === txPts.length - 1 ? step / 2 + 4 : step;
            const hx = i === 0 ? p.x : p.x - step / 2;
            return (
              <rect
                key={`hz-${i}`}
                x={hx}
                y={PT}
                width={hw}
                height={cH}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() =>
                  setHoveredPoint({
                    index: i,
                    x: p.x,
                    y: p.y,
                    val: p.val,
                    blockHeight: chartBlocks[i].height,
                    timestamp: chartBlocks[i].timestamp,
                    gasUsed: chartBlocks[i].gas_used,
                    gasLimit: chartBlocks[i].gas_limit,
                    txCount: chartBlocks[i].transactions_count,
                  })
                }
              />
            );
          })}
        </svg>

        {/* Rich floating tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: `${(hoveredPoint.x / W) * 100}%`,
              top: `${Math.max((hoveredPoint.y / H) * 100 - 8, 2)}%`,
              transform: 'translate(-50%, -100%)',
              padding: '12px 16px',
              borderRadius: '14px',
              zIndex: 20,
              pointerEvents: 'none',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              background: 'rgba(10, 12, 20, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 62, 77, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 12px rgba(255, 62, 77, 0.15)',
              animation: 'slideUp 0.15s ease-out',
            }}
          >
            {/* Block header */}
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '12px',
                color: '#FFF',
                marginBottom: '8px',
                paddingBottom: '6px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#FF3E4D',
                  boxShadow: '0 0 6px #FF3E4D',
                  display: 'inline-block',
                }}
              />
              Block #{hoveredPoint.blockHeight.toLocaleString()}
            </div>

            {/* Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
                <span style={{ color: '#94A3B8' }}>Transactions</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#FF3E4D' }}>
                  {hoveredPoint.val}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
                <span style={{ color: '#94A3B8' }}>Gas Used</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#00F2FE' }}>
                  {parseInt(hoveredPoint.gasUsed).toLocaleString()}
                </span>
              </div>
              {hoveredPoint.timestamp && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
                  <span style={{ color: '#94A3B8' }}>Time</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#64748B' }}>
                    {new Date(hoveredPoint.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const truncateHash = (hash, size = 6) => {
    if (!hash) return '';
    return `${hash.slice(0, size)}...${hash.slice(-size)}`;
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
        <RefreshCw className="animate-pulse" size={48} style={{ color: 'var(--color-primary)', animation: 'spin 2s linear infinite' }} />
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Syncing GIWA Chain Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fadeIn">
      {/* Search Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '38px', marginBottom: '8px', fontWeight: 800 }}>Ondol Intelligence</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto 24px auto', fontSize: '15px' }}>
          Real-time block telemetry and AI-powered smart contract security on GIWA Chain.
        </p>

        <form onSubmit={handleSearchSubmit} className="search-container">
          <div className="glass-card search-card">
            <Search className="input-icon" style={{ position: 'relative', left: '12px' }} size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by address, tx hash, block number or verified contract..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Inspect <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Network Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Total Blocks */}
        <div className="glass-card highlight-red" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255, 62, 77, 0.1)', border: '1px solid rgba(255, 62, 77, 0.2)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
            <Layers size={24} />
          </div>
          <div>
            <p className="input-label" style={{ fontSize: '10px' }}>Current Height</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {stats?.total_blocks ? parseInt(stats.total_blocks).toLocaleString() : 'N/A'}
            </h3>
            <p style={{ fontSize: '11px', display: 'flex', gap: '4px', alignItems: 'center' }}>
              Block Time: <span className="badge badge-red" style={{ padding: '1px 5px', fontSize: '9px' }}>1s</span>
            </p>
          </div>
        </div>

        {/* Transactions Info */}
        <div className="glass-card highlight-cyan" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--color-secondary)' }}>
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <p className="input-label" style={{ fontSize: '10px' }}>Daily Transactions</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {stats?.transactions_today ? parseInt(stats.transactions_today).toLocaleString() : 'N/A'}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-dark)' }}>
              Total: {stats?.total_transactions ? parseInt(stats.total_transactions).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Gas Oracle */}
        <div className="glass-card highlight-red" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255, 62, 77, 0.1)', border: '1px solid rgba(255, 62, 77, 0.2)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
            <Cpu size={24} />
          </div>
          <div>
            <p className="input-label" style={{ fontSize: '10px' }}>Gas Oracle</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
              {stats?.gas_prices?.average ? `${stats.gas_prices.average} Gwei` : '0.07 Gwei'}
            </h3>
            <p style={{ fontSize: '11px' }}>
              Fast: <span style={{ color: 'var(--color-primary)' }}>{stats?.gas_prices?.fast || '0.22'} Gwei</span>
            </p>
          </div>
        </div>

        {/* Network Utilization */}
        <div className="glass-card highlight-cyan" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--color-secondary)' }}>
            <Server size={24} />
          </div>
          <div>
            <p className="input-label" style={{ fontSize: '10px' }}>Wallets & Utilization</p>
            <h3 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {(stats?.network_utilization_percentage || 1.63).toFixed(2)}%
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Addresses: {stats?.total_addresses ? parseInt(stats.total_addresses).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

      </div>

      {/* Chart Section */}
      <div className="glass-card" style={{ marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        {/* Chart Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.01em' }}>Block Activity Stream</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-dark)' }}>
              Live transaction throughput & gas consumption across recent blocks
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Chart legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--color-text-dark)', fontFamily: 'var(--font-mono)' }}>
              <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: '#FF3E4D', display: 'inline-block' }} />
              TX Count
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--color-text-dark)', fontFamily: 'var(--font-mono)' }}>
              <span style={{ width: '10px', height: '2px', borderRadius: '2px', background: '#00F2FE', display: 'inline-block', opacity: 0.5 }} />
              Gas Used
            </div>
            {/* Live stat badges */}
            {blocks.length > 0 && (
              <>
                <span className="badge badge-red" style={{ padding: '3px 8px', fontSize: '9px' }}>
                  Peak: {Math.max(...blocks.slice(0, 10).map(b => b.transactions_count || 0))} TX
                </span>
                <span className="badge badge-cyan" style={{ padding: '3px 8px', fontSize: '9px' }}>
                  Avg: {Math.round(blocks.slice(0, 10).reduce((a, b) => a + (b.transactions_count || 0), 0) / Math.min(blocks.length, 10))} TX
                </span>
              </>
            )}
            {isRefreshing && (
              <span className="badge badge-success" style={{ display: 'flex', gap: '5px', padding: '3px 8px', fontSize: '9px' }}>
                <RefreshCw size={10} className="animate-spin" /> Syncing
              </span>
            )}
          </div>
        </div>
        {renderTxChart()}
      </div>

      {/* Tables Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(48%, 1fr))', gap: '32px' }}>
        
        {/* Recent Blocks Table */}
        <div className="glass-card" style={{ padding: '20px 0' }}>
          <div style={{ padding: '0 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Layers size={18} style={{ color: 'var(--color-primary)' }} />
              Latest Blocks
            </h3>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Height</th>
                  <th>Age</th>
                  <th>TX Count</th>
                  <th>Gas Used</th>
                </tr>
              </thead>
              <tbody>
                {blocks.slice(0, 10).map((block) => (
                  <tr key={block.hash}>
                    <td>
                      <span 
                        onClick={() => onBlockClick(block.height)}
                        className="mono-text" 
                        style={{ color: 'var(--color-secondary)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        #{block.height}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px' }}>{formatTime(block.timestamp)}</td>
                    <td className="mono-text">{block.transactions_count}</td>
                    <td className="mono-text" style={{ fontSize: '12px', color: 'var(--color-text-dark)' }}>
                      {parseInt(block.gas_used).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="glass-card" style={{ padding: '20px 0' }}>
          <div style={{ padding: '0 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ArrowRightLeft size={18} style={{ color: 'var(--color-secondary)' }} />
              Recent Transactions
            </h3>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Hash</th>
                  <th>Method</th>
                  <th>From</th>
                  <th>To</th>
                </tr>
              </thead>
              <tbody>
                {txs.slice(0, 10).map((tx) => (
                  <tr key={tx.hash}>
                    <td>
                      <span 
                        onClick={() => onTxClick(tx.hash)}
                        className="mono-text" 
                        style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                        title={tx.hash}
                      >
                        {truncateHash(tx.hash)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${tx.method ? 'badge-purple' : 'badge-cyan'}`} style={{ fontSize: '9px', padding: '2px 6px', textTransform: 'uppercase' }}>
                        {tx.method || 'transfer'}
                      </span>
                    </td>
                    <td>
                      <span 
                        onClick={() => onAddressClick(tx.from?.hash)}
                        className="mono-text" 
                        style={{ cursor: 'pointer', fontSize: '12px' }}
                        title={tx.from?.hash}
                      >
                        {truncateHash(tx.from?.hash, 4)}
                      </span>
                    </td>
                    <td>
                      {tx.to ? (
                        <span 
                          onClick={() => onAddressClick(tx.to?.hash)}
                          className="mono-text" 
                          style={{ cursor: 'pointer', fontSize: '12px' }}
                          title={tx.to?.hash}
                        >
                          {truncateHash(tx.to?.hash, 4)}
                        </span>
                      ) : tx.created_contract ? (
                        <span 
                          onClick={() => onAddressClick(tx.created_contract?.hash)}
                          className="mono-text" 
                          style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--color-success)' }}
                          title={`Created contract: ${tx.created_contract?.hash}`}
                        >
                          [Deploy] {truncateHash(tx.created_contract?.hash, 4)}
                        </span>
                      ) : (
                        <span className="mono-text" style={{ color: 'var(--color-text-dark)' }}>N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Watchlist & Whale alerts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(48%, 1fr))', gap: '32px', marginTop: '32px' }}>
        
        {/* Bookmarks Watchlist */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--color-warning)' }}>★</span> Bookmarked Watchlist
          </h3>
          {watchlist.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-dark)', lineHeight: '1.4' }}>
              No addresses in watchlist. Inspect an address in the Explorer tab and bookmark it to track active contracts or wallets here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {watchlist.map((addr) => (
                <div key={addr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <span 
                    onClick={() => onAddressClick(addr)}
                    className="mono-text" 
                    style={{ color: 'var(--color-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    {truncateHash(addr, 10)}
                  </span>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => removeBookmark(addr)} 
                    style={{ color: 'var(--color-error)', borderColor: 'rgba(255, 23, 68, 0.2)', padding: '4px 10px', fontSize: '11px', borderRadius: 'var(--radius-sm)' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Whale Alerts */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
            <span>🐳</span> Live Whale Transfers (&gt; 0.1 ETH)
          </h3>
          {txs.filter(tx => tx.value && parseFloat(tx.value) >= 0.1 * 1e18).length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-dark)' }}>
              No recent whale transactions detected on Sepolia testnet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
              {txs.filter(tx => tx.value && parseFloat(tx.value) >= 0.1 * 1e18).slice(0, 10).map((tx) => (
                <div key={tx.hash} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0, 242, 254, 0.03)', border: '1px solid rgba(0, 242, 254, 0.1)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span 
                      onClick={() => onTxClick(tx.hash)}
                      className="mono-text" 
                      style={{ color: 'var(--color-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      {truncateHash(tx.hash, 8)}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      From: {truncateHash(tx.from?.hash, 4)} → To: {truncateHash(tx.to?.hash || 'Contract', 4)}
                    </span>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    {(parseFloat(tx.value) / 1e18).toFixed(2)} ETH
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
