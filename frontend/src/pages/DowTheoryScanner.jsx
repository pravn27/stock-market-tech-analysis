/**
 * Checklist Scanner Page
 * PAPA + SMM Multi-Timeframe Analysis
 * Dow Theory + Technical Indicators across Super TIDE, TIDE, WAVE, RIPPLE
 */

import { useState, useEffect } from 'react';
import { scanDowTheory, getDowTheoryAnalysis } from '../api/scanner';
import Loader from '../components/Loader';
import StockAnalysis from './StockAnalysis';

const FILTERS = [
  { value: 'all', label: 'All Stocks' },
  { value: 'strong_buy', label: '🟢 Strong Buy' },
  { value: 'pullback_buy', label: '🟡 Pullback Buy' },
  { value: 'intraday_buy', label: '🔵 Intraday Buy' },
  { value: 'bearish', label: '🔴 Bearish' },
  { value: 'wait', label: '⚪ Wait / No Trade' },
];

// Nifty 50 + Popular stocks for autocomplete
const STOCK_LIST = [
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank' },
  { symbol: 'INFY', name: 'Infosys' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever' },
  { symbol: 'SBIN', name: 'State Bank of India' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel' },
  { symbol: 'ITC', name: 'ITC' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank' },
  { symbol: 'LT', name: 'Larsen & Toubro' },
  { symbol: 'AXISBANK', name: 'Axis Bank' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki' },
  { symbol: 'HCLTECH', name: 'HCL Technologies' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical' },
  { symbol: 'TITAN', name: 'Titan Company' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance' },
  { symbol: 'WIPRO', name: 'Wipro' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp' },
  { symbol: 'NTPC', name: 'NTPC' },
  { symbol: 'POWERGRID', name: 'Power Grid Corp' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel' },
  { symbol: 'TATASTEEL', name: 'Tata Steel' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports' },
  { symbol: 'COALINDIA', name: 'Coal India' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv' },
  { symbol: 'TECHM', name: 'Tech Mahindra' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank' },
  { symbol: 'NESTLEIND', name: 'Nestle India' },
  { symbol: 'DRREDDY', name: 'Dr Reddys Labs' },
  { symbol: 'CIPLA', name: 'Cipla' },
  { symbol: 'GRASIM', name: 'Grasim Industries' },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance' },
  { symbol: 'BPCL', name: 'Bharat Petroleum' },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance' },
  { symbol: 'SHRIRAMFIN', name: 'Shriram Finance' },
  { symbol: 'LTIM', name: 'LTIMindtree' },
];

const MTF_GROUPS = [
  { key: 'super_tide', name: 'Super TIDE', timeframes: ['monthly', 'weekly'] },
  { key: 'tide', name: 'TIDE', timeframes: ['daily', '4h'] },
  { key: 'wave', name: 'WAVE', timeframes: ['4h', '1h'] },
  { key: 'ripple', name: 'RIPPLE', timeframes: ['1h', '15m'] },
];

const TF_LABELS = {
  monthly: 'M',
  weekly: 'W',
  daily: 'D',
  '4h': '4H',
  '1h': '1H',
  '15m': '15M',
};

const DowTheoryScanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Single stock input with autocomplete
  const [symbolInput, setSymbolInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // View mode: 'scanner' or 'analysis'
  const [viewMode, setViewMode] = useState('scanner');
  const [selectedStock, setSelectedStock] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await scanDowTheory('nifty50', filter, null, 50);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSymbolInput(value);
    setSelectedIndex(-1);
    
    if (value.length > 0) {
      const filtered = STOCK_LIST.filter(
        stock => 
          stock.symbol.includes(value) || 
          stock.name.toUpperCase().includes(value)
      ).slice(0, 8); // Show max 8 suggestions
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (symbol) => {
    setSymbolInput(symbol);
    setShowSuggestions(false);
    setSuggestions([]);
    openStockAnalysis(symbol);
  };

  const analyzeSymbol = () => {
    const symbol = symbolInput.trim().toUpperCase();
    if (symbol) {
      setShowSuggestions(false);
      openStockAnalysis(symbol);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        analyzeSymbol();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        selectSuggestion(suggestions[selectedIndex].symbol);
      } else {
        analyzeSymbol();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const openStockAnalysis = (symbol) => {
    setSelectedStock(symbol);
    setViewMode('analysis');
  };

  const backToScanner = () => {
    setViewMode('scanner');
    setSelectedStock(null);
    setSymbolInput('');
  };

  // Get color class for trend
  const getTrendColor = (color) => {
    const colorMap = {
      green: 'trend-green',
      lightgreen: 'trend-lightgreen',
      red: 'trend-red',
      orange: 'trend-orange',
      yellow: 'trend-yellow',
      gray: 'trend-gray',
      cyan: 'trend-cyan',
      pink: 'trend-pink',
    };
    return colorMap[color] || 'trend-gray';
  };

  // Get emoji for trend
  const getTrendEmoji = (trend) => {
    if (!trend) return '⚪';
    if (trend === 'HH-HL') return '🟢';
    if (trend === 'LL-LH') return '🔴';
    if (trend === 'LL→HL') return '🟡';  // Transition up
    if (trend === 'HH→LH') return '🟠';  // Transition down
    if (trend === 'Sideways') return '⚪';
    return '⚪';
  };

  // Get trend label display
  const getTrendLabel = (tf) => {
    if (!tf) return '-';
    const high = tf.last_high_label || '-';
    const low = tf.last_low_label || '-';
    return `${high}/${low}`;
  };

  // If viewing stock analysis page
  if (viewMode === 'analysis' && selectedStock) {
    return <StockAnalysis symbol={selectedStock} onBack={backToScanner} />;
  }

  // Scanner view
  return (
    <div className="dow-scanner">
      {/* Header */}
      <div className="dow-header">
        <div className="dow-title">
          <h2>📋 Checklist Scanner</h2>
          <p>PAPA + SMM Multi-Timeframe Analysis</p>
        </div>
      </div>

      {/* Controls */}
      <div className="dow-controls">
        {/* Single Stock Analysis */}
        <div className="control-group symbol-input-group">
          <label>Analyze Symbol</label>
          <div className="symbol-autocomplete">
            <div className="symbol-input-wrapper">
              <input
                type="text"
                value={symbolInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => symbolInput && suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Type symbol or name..."
                className="symbol-input"
                autoComplete="off"
              />
              <button 
                className="analyze-btn" 
                onClick={analyzeSymbol}
                disabled={!symbolInput.trim()}
              >
                📊 Analyze
              </button>
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((stock, index) => (
                  <li 
                    key={stock.symbol}
                    className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => selectSuggestion(stock.symbol)}
                  >
                    <span className="suggestion-symbol">{stock.symbol}</span>
                    <span className="suggestion-name">{stock.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="controls-divider">OR</div>

        {/* Bulk Scan */}
        <div className="control-group bulk-scan-group">
          <label>Filter</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <button className="refresh-btn" onClick={fetchData} disabled={loading}>
            {loading ? 'Scanning...' : '🔍 Scan Nifty 50'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="dow-error">
          <span>{error}</span>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && <Loader message="Scanning all timeframes... This may take a minute." />}

      {/* Empty State */}
      {!loading && !error && !data && (
        <div className="dow-empty">
          <div className="dow-empty-icon">📊</div>
          <p>Click <strong>Scan Nifty 50</strong> to analyze stocks</p>
          <p className="dow-empty-hint">Analysis covers: Monthly, Weekly, Daily, 4H, 1H, 15M timeframes</p>
        </div>
      )}

      {/* Results Table */}
      {!loading && data && data.stocks && (
        <div className="dow-content">
          <div className="dow-results-header">
            <span>Found {data.total} stocks</span>
            <span className="filter-badge">{FILTERS.find(f => f.value === filter)?.label}</span>
          </div>

          <div className="dow-table-wrapper">
            <table className="dow-table">
              <thead>
                <tr>
                  <th className="stock-col">Stock</th>
                  <th className="mtf-col" colSpan="2">Super TIDE<br/><small>M | W</small></th>
                  <th className="mtf-col" colSpan="2">TIDE<br/><small>D | 4H</small></th>
                  <th className="mtf-col" colSpan="2">WAVE<br/><small>4H | 1H</small></th>
                  <th className="mtf-col" colSpan="2">RIPPLE<br/><small>1H | 15M</small></th>
                  <th className="opp-col">Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {data.stocks.map((stock, idx) => {
                  const tfs = stock.timeframes || {};
                  const opp = stock.opportunity || {};
                  
                  return (
                    <tr 
                      key={stock.symbol} 
                      className="dow-row"
                      onClick={() => openStockAnalysis(stock.symbol)}
                    >
                      <td className="stock-cell">
                        <span className="stock-rank">{idx + 1}</span>
                        <span className="stock-name">{stock.symbol}</span>
                        <span className="stock-arrow">▶</span>
                      </td>
                      
                      {/* Super TIDE: M, W */}
                      <td className={`trend-cell ${getTrendColor(tfs.monthly?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs.monthly?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs.monthly)}</span>
                      </td>
                      <td className={`trend-cell ${getTrendColor(tfs.weekly?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs.weekly?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs.weekly)}</span>
                      </td>
                      
                      {/* TIDE: D, 4H */}
                      <td className={`trend-cell ${getTrendColor(tfs.daily?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs.daily?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs.daily)}</span>
                      </td>
                      <td className={`trend-cell ${getTrendColor(tfs['4h']?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs['4h']?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs['4h'])}</span>
                      </td>
                      
                      {/* WAVE: 4H, 1H */}
                      <td className={`trend-cell ${getTrendColor(tfs['4h']?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs['4h']?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs['4h'])}</span>
                      </td>
                      <td className={`trend-cell ${getTrendColor(tfs['1h']?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs['1h']?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs['1h'])}</span>
                      </td>
                      
                      {/* RIPPLE: 1H, 15M */}
                      <td className={`trend-cell ${getTrendColor(tfs['1h']?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs['1h']?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs['1h'])}</span>
                      </td>
                      <td className={`trend-cell ${getTrendColor(tfs['15m']?.color)}`}>
                        <span className="trend-emoji">{getTrendEmoji(tfs['15m']?.trend)}</span>
                        <span className="trend-label">{getTrendLabel(tfs['15m'])}</span>
                      </td>
                      
                      {/* Opportunity */}
                      <td className={`opp-cell ${getTrendColor(opp.color)}`}>
                        <span className="opp-type">{opp.type || '-'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="dow-footer">
            <div className="dow-legend">
              <span>🟢 HH-HL = Uptrend</span>
              <span>🟡 LL→HL = Transition Up</span>
              <span>⚪ Sideways</span>
              <span>🟠 HH→LH = Transition Down</span>
              <span>🔴 LL-LH = Downtrend</span>
            </div>
            <div className="dow-help">
              💡 Click any row for detailed pivot analysis • HH=Higher High, HL=Higher Low, LH=Lower High, LL=Lower Low
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DowTheoryScanner;
