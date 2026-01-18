/**
 * Performance Overview Page - Clean & Simple UX
 * Shows top performers across timeframes with easy navigation
 */

import { useState } from 'react';
import { getTopPerformers, getSectorStocks } from '../api/scanner';
import Loader from '../components/Loader';

const TIMEFRAMES = [
  { key: '3M', label: '3 Month' },
  { key: 'M', label: 'Monthly' },
  { key: 'W', label: 'Weekly' },
  { key: 'D', label: 'Daily' },
  { key: '4H', label: '4 Hour' },
  { key: '1H', label: '1 Hour' }
];

const PerformanceOverview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [limit, setLimit] = useState(5);
  const [selectedTimeframe, setSelectedTimeframe] = useState('D');
  
  // Expanded sector for stocks view
  const [expandedSector, setExpandedSector] = useState(null);
  const [sectorStocks, setSectorStocks] = useState(null);
  const [stocksLoading, setStocksLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setExpandedSector(null);
    setSectorStocks(null);
    try {
      const result = await getTopPerformers(limit, 'all');
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSectorClick = async (sectorName) => {
    if (expandedSector === sectorName) {
      setExpandedSector(null);
      setSectorStocks(null);
      return;
    }

    setExpandedSector(sectorName);
    setStocksLoading(true);
    
    const tfMap = { '3M': '3m', 'M': 'monthly', 'W': 'weekly', 'D': 'daily', '4H': '4h', '1H': '1h' };
    const apiTf = tfMap[selectedTimeframe] || 'daily';
    
    try {
      const result = await getSectorStocks(sectorName, apiTf, 1);
      setSectorStocks(result);
    } catch (err) {
      console.error('Failed to fetch stocks:', err);
      setSectorStocks(null);
    } finally {
      setStocksLoading(false);
    }
  };

  const formatValue = (value, showSign = true) => {
    if (value === null || value === undefined) return '-';
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getValueColor = (value, type = 'return') => {
    if (value === null || value === undefined) return 'neutral';
    if (type === 'rs') {
      return value > 1 ? 'positive' : value < -1 ? 'negative' : 'neutral';
    }
    return value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
  };

  const getTfKey = () => {
    const map = { '3M': 'three_month', 'M': 'monthly', 'W': 'weekly', 'D': 'daily', '4H': 'four_hour', '1H': 'one_hour' };
    return map[selectedTimeframe] || 'daily';
  };

  const renderSectorCard = (item, index, type) => {
    const isExpanded = expandedSector === item.name;
    const colorClass = type === 'outperforming' ? 'green' : type === 'underperforming' ? 'red' : 'gray';
    
    return (
      <div 
        key={item.symbol}
        className={`sector-card ${colorClass} ${isExpanded ? 'expanded' : ''}`}
        onClick={() => handleSectorClick(item.name)}
      >
        <div className="sector-card-rank">{index + 1}</div>
        <div className="sector-card-content">
          <div className="sector-card-name">{item.name}</div>
          <div className="sector-card-stats">
            <span className={`return-value ${getValueColor(item.return)}`}>
              {formatValue(item.return)}
            </span>
            <span className="rs-label">RS:</span>
            <span className={`rs-value ${getValueColor(item.rs, 'rs')}`}>
              {formatValue(item.rs, false)}
            </span>
          </div>
        </div>
        <div className="sector-card-arrow">{isExpanded ? '▼' : '▶'}</div>
      </div>
    );
  };

  const renderStocksExpanded = () => {
    if (!expandedSector || !sectorStocks) return null;
    
    const tfKey = getTfKey();
    const topStocks = [...(sectorStocks.stocks || [])].slice(0, limit);
    
    return (
      <div className="stocks-expanded">
        <div className="stocks-expanded-header">
          <h4>{expandedSector} - Top {limit} Stocks</h4>
          <button onClick={() => { setExpandedSector(null); setSectorStocks(null); }}>✕</button>
        </div>
        {stocksLoading ? (
          <div className="stocks-loading">Loading stocks...</div>
        ) : (
          <div className="stocks-list-simple">
            {topStocks.map((stock, idx) => (
              <div key={stock.symbol} className={`stock-row ${stock.status}`}>
                <span className="stock-rank">{idx + 1}</span>
                <span className="stock-name">{stock.name}</span>
                <span className={`stock-return ${getValueColor(stock.returns?.[tfKey])}`}>
                  {formatValue(stock.returns?.[tfKey])}
                </span>
                <span className={`stock-rs ${getValueColor(stock.relative_strength?.[tfKey], 'rs')}`}>
                  {formatValue(stock.relative_strength?.[tfKey], false)}
                </span>
                <span className={`stock-status-badge ${stock.status}`}>
                  {stock.status === 'outperforming' ? '↑' : stock.status === 'underperforming' ? '↓' : '–'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const currentData = data || {};
  const outperforming = currentData.outperforming?.[selectedTimeframe] || [];
  const underperforming = currentData.underperforming?.[selectedTimeframe] || [];
  const neutral = currentData.neutral?.[selectedTimeframe] || [];

  return (
    <div className="perf-overview">
      {/* Header */}
      <div className="perf-header">
        <div className="perf-title">
          <h2>Performance Overview</h2>
          <p>Top performing & underperforming sectors at a glance</p>
        </div>
      </div>

      {/* Controls */}
      <div className="perf-controls">
        <div className="perf-control-group">
          <label>Show Top</label>
          <input
            type="number"
            min="1"
            max="20"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
          />
        </div>
        
        <div className="perf-timeframe-tabs">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.key}
              className={`tf-tab ${selectedTimeframe === tf.key ? 'active' : ''}`}
              onClick={() => setSelectedTimeframe(tf.key)}
              title={tf.label}
            >
              {tf.key}
            </button>
          ))}
        </div>
        
        <button className="perf-refresh-btn" onClick={fetchData} disabled={loading}>
          {loading ? '...' : '↻ Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="perf-error">
          <span>{error}</span>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && <Loader message="Loading performance data..." />}

      {/* Empty State */}
      {!loading && !error && !data && (
        <div className="perf-empty">
          <div className="perf-empty-icon">📊</div>
          <p>Click <strong>Refresh</strong> to load sector performance data</p>
        </div>
      )}

      {/* Main Content */}
      {!loading && data && (
        <div className="perf-content">
          {/* Three Columns */}
          <div className="perf-columns">
            {/* Outperforming */}
            <div className="perf-column outperforming">
              <div className="perf-column-header">
                <span className="indicator green"></span>
                <h3>Outperforming</h3>
                <span className="count">{outperforming.length}</span>
              </div>
              <div className="perf-column-body">
                {outperforming.length === 0 ? (
                  <div className="no-items">No outperforming sectors</div>
                ) : (
                  outperforming.map((item, idx) => renderSectorCard(item, idx, 'outperforming'))
                )}
              </div>
            </div>

            {/* Neutral */}
            <div className="perf-column neutral">
              <div className="perf-column-header">
                <span className="indicator gray"></span>
                <h3>Neutral</h3>
                <span className="count">{neutral.length}</span>
              </div>
              <div className="perf-column-body">
                {neutral.length === 0 ? (
                  <div className="no-items">No neutral sectors</div>
                ) : (
                  neutral.map((item, idx) => renderSectorCard(item, idx, 'neutral'))
                )}
              </div>
            </div>

            {/* Underperforming */}
            <div className="perf-column underperforming">
              <div className="perf-column-header">
                <span className="indicator red"></span>
                <h3>Underperforming</h3>
                <span className="count">{underperforming.length}</span>
              </div>
              <div className="perf-column-body">
                {underperforming.length === 0 ? (
                  <div className="no-items">No underperforming sectors</div>
                ) : (
                  underperforming.map((item, idx) => renderSectorCard(item, idx, 'underperforming'))
                )}
              </div>
            </div>
          </div>

          {/* Expanded Stocks */}
          {renderStocksExpanded()}

          {/* Help Text */}
          <div className="perf-help">
            💡 Click on any sector to see its top stocks
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceOverview;
