/**
 * Performance Overview Page
 * Shows top N outperforming, underperforming, and neutral sectors across all timeframes
 */

import { useState, useEffect } from 'react';
import { getTopPerformers, getSectorStocks } from '../api/scanner';
import Loader from '../components/Loader';

const PerformanceOverview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [limit, setLimit] = useState(3);
  const [include, setInclude] = useState('all');
  
  // Expanded sector state
  const [expandedSector, setExpandedSector] = useState(null);
  const [sectorStocks, setSectorStocks] = useState(null);
  const [stocksLoading, setStocksLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTopPerformers(limit, include);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch sector stocks when a sector is clicked
  const handleSectorClick = async (sectorName, timeframe) => {
    const key = `${sectorName}-${timeframe}`;
    
    if (expandedSector === key) {
      // Collapse if already expanded
      setExpandedSector(null);
      setSectorStocks(null);
      return;
    }

    setExpandedSector(key);
    setStocksLoading(true);
    
    // Map timeframe label to API value
    const tfMap = { '3M': '3m', 'M': 'monthly', 'W': 'weekly', 'D': 'daily', '4H': '4h', '1H': '1h' };
    const apiTf = tfMap[timeframe] || 'daily';
    
    try {
      const result = await getSectorStocks(sectorName, apiTf, 1);
      setSectorStocks({ ...result, timeframe: apiTf, tfLabel: timeframe });
    } catch (err) {
      console.error('Failed to fetch sector stocks:', err);
      setSectorStocks(null);
    } finally {
      setStocksLoading(false);
    }
  };

  const formatReturn = (value) => {
    if (value === null || value === undefined) return '-';
    const color = value > 0 ? '#4ade80' : value < 0 ? '#f87171' : '#9ca3af';
    return <span style={{ color }}>{value > 0 ? '+' : ''}{value.toFixed(2)}%</span>;
  };

  const formatRS = (value) => {
    if (value === null || value === undefined) return '-';
    const color = value > 1 ? '#4ade80' : value < -1 ? '#f87171' : '#9ca3af';
    return <span style={{ color }}>{value > 0 ? '+' : ''}{value.toFixed(2)}</span>;
  };

  const renderMatrix = (category, title, icon, bgClass) => {
    if (!data || !data[category]) return null;
    
    const timeframes = data.timeframes || ['3M', 'M', 'W', 'D', '4H', '1H'];
    
    return (
      <div className={`performance-matrix ${bgClass}`}>
        <h3 className="matrix-title">
          <span className="matrix-icon">{icon}</span>
          {title} (Top {data.limit})
        </h3>
        <div className="matrix-table-container">
          <table className="matrix-table">
            <thead>
              <tr>
                <th className="rank-col">#</th>
                {timeframes.map(tf => (
                  <th key={tf} className="tf-col">{tf}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: data.limit }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="rank-col">{rowIndex + 1}</td>
                  {timeframes.map(tf => {
                    const items = data[category][tf] || [];
                    const item = items[rowIndex];
                    
                    if (!item) {
                      return <td key={tf} className="empty-cell">-</td>;
                    }
                    
                    const isExpanded = expandedSector === `${item.name}-${tf}`;
                    
                    return (
                      <td 
                        key={tf} 
                        className={`sector-cell ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => handleSectorClick(item.name, tf)}
                        title={`${item.name}\nReturn: ${item.return?.toFixed(2)}%\nRS: ${item.rs?.toFixed(2)}`}
                      >
                        <div className="sector-name">{item.name.replace('Nifty ', '').replace('NIFTY ', '')}</div>
                        <div className="sector-stats">
                          {formatReturn(item.return)}
                          <span className="rs-badge">{formatRS(item.rs)}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render expanded stocks panel
  const renderStocksPanel = () => {
    if (!expandedSector || !sectorStocks) return null;
    
    const tfKey = {
      '3m': 'three_month', 'monthly': 'monthly', 'weekly': 'weekly',
      'daily': 'daily', '4h': 'four_hour', '1h': 'one_hour'
    }[sectorStocks.timeframe] || 'daily';
    
    return (
      <div className="stocks-panel">
        <div className="stocks-panel-header">
          <h4>
            {sectorStocks.sector_name} - Top {limit} Stocks ({sectorStocks.tfLabel})
          </h4>
          <button className="close-btn" onClick={() => { setExpandedSector(null); setSectorStocks(null); }}>
            ✕
          </button>
        </div>
        
        {stocksLoading ? (
          <div className="stocks-loading">Loading stocks...</div>
        ) : (
          <div className="stocks-grid">
            {/* Outperforming Stocks */}
            <div className="stocks-category outperforming">
              <h5>🟢 Outperforming ({sectorStocks.outperforming?.length || 0})</h5>
              <div className="stocks-list">
                {(sectorStocks.outperforming || []).slice(0, limit).map((stock, idx) => (
                  <div key={stock.symbol} className="stock-item">
                    <span className="stock-rank">{idx + 1}</span>
                    <span className="stock-name">{stock.name}</span>
                    <span className="stock-return">{formatReturn(stock.returns?.[tfKey])}</span>
                  </div>
                ))}
                {(!sectorStocks.outperforming || sectorStocks.outperforming.length === 0) && (
                  <div className="no-stocks">No outperforming stocks</div>
                )}
              </div>
            </div>
            
            {/* Underperforming Stocks */}
            <div className="stocks-category underperforming">
              <h5>🔴 Underperforming ({sectorStocks.underperforming?.length || 0})</h5>
              <div className="stocks-list">
                {(sectorStocks.underperforming || []).slice(0, limit).map((stock, idx) => (
                  <div key={stock.symbol} className="stock-item">
                    <span className="stock-rank">{idx + 1}</span>
                    <span className="stock-name">{stock.name}</span>
                    <span className="stock-return">{formatReturn(stock.returns?.[tfKey])}</span>
                  </div>
                ))}
                {(!sectorStocks.underperforming || sectorStocks.underperforming.length === 0) && (
                  <div className="no-stocks">No underperforming stocks</div>
                )}
              </div>
            </div>
            
            {/* Neutral Stocks */}
            <div className="stocks-category neutral">
              <h5>⚪ Neutral ({sectorStocks.neutral?.length || 0})</h5>
              <div className="stocks-list">
                {(sectorStocks.neutral || []).slice(0, limit).map((stock, idx) => (
                  <div key={stock.symbol} className="stock-item">
                    <span className="stock-rank">{idx + 1}</span>
                    <span className="stock-name">{stock.name}</span>
                    <span className="stock-return">{formatReturn(stock.returns?.[tfKey])}</span>
                  </div>
                ))}
                {(!sectorStocks.neutral || sectorStocks.neutral.length === 0) && (
                  <div className="no-stocks">No neutral stocks</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="performance-overview-page">
      <div className="page-header">
        <h2>📊 Performance Overview</h2>
        <p className="page-subtitle">Top performers across all timeframes - Click any sector to see stocks</p>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="filter-group">
          <label>Show Top:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, Math.min(20, parseInt(e.target.value) || 3)))}
            className="limit-input"
          />
        </div>
        
        <div className="filter-group">
          <label>Include:</label>
          <select value={include} onChange={(e) => setInclude(e.target.value)} className="filter-select">
            <option value="all">All Indices</option>
            <option value="sectorial">Sectors Only</option>
            <option value="broad_market">Broad Market</option>
            <option value="thematic">Thematic</option>
          </select>
        </div>
        
        <button className="refresh-btn" onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          {error}
          <button className="retry-btn" onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && <Loader message="Fetching performance data across all timeframes..." />}

      {/* No data message */}
      {!loading && !error && !data && (
        <div className="no-data">
          Click Refresh to load performance data
        </div>
      )}

      {/* Main Content */}
      {!loading && data && (
        <div className="performance-content">
          {/* Benchmark Info */}
          {data.benchmark && (
            <div className="benchmark-info">
              <span className="benchmark-label">Benchmark:</span>
              <span className="benchmark-name">{data.benchmark.name}</span>
              <span className="benchmark-price">₹{data.benchmark.price?.toFixed(2)}</span>
            </div>
          )}

          {/* Three Matrices */}
          <div className="matrices-container">
            {renderMatrix('outperforming', 'Outperforming', '🟢', 'matrix-outperforming')}
            {renderMatrix('underperforming', 'Underperforming', '🔴', 'matrix-underperforming')}
            {renderMatrix('neutral', 'Neutral', '⚪', 'matrix-neutral')}
          </div>

          {/* Expanded Stocks Panel */}
          {renderStocksPanel()}

          {/* Legend */}
          <div className="legend">
            <span className="legend-item">
              <span className="legend-dot green"></span> Outperforming (RS &gt; 1%)
            </span>
            <span className="legend-item">
              <span className="legend-dot red"></span> Underperforming (RS &lt; -1%)
            </span>
            <span className="legend-item">
              <span className="legend-dot gray"></span> Neutral (-1% to 1%)
            </span>
            <span className="legend-item clickable">
              💡 Click any sector to see its stocks
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceOverview;
